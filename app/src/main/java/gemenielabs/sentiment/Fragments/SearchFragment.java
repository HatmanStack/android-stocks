package gemenielabs.sentiment.Fragments;

import android.content.Context;
import android.icu.util.Calendar;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CalendarView;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import gemenielabs.sentiment.DataProcessing.SetSearchSymbolData;
import gemenielabs.sentiment.Helper.PriceLiveData;
import gemenielabs.sentiment.MainActivity;
import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Recycler.SearchRecycler;
import okhttp3.OkHttpClient;

public class SearchFragment extends Fragment implements SearchRecycler.SearchClickListener {

    // Declare variables
    private EditText searchText;
    private PriceLiveData model;
    private SearchRecycler searchRecycler;
    private CalendarView calendarStart;
    public static String holderTicker;
    private Context context;
    public static OkHttpClient client = new OkHttpClient().newBuilder()
            .readTimeout(45, TimeUnit.SECONDS).build();

    // Create a new instance of the SearchFragment
    public static SearchFragment newInstance() {
        return new SearchFragment();
    }

    // Inflate the layout for this fragment
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        context = getActivity().getApplicationContext();
        return inflater.inflate(R.layout.search_fragment, container, false);
    }

    // Initialize the view and set up the search button and calendar
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        model = new ViewModelProvider(requireActivity()).get(PriceLiveData.class);
        Button searchButton = view.findViewById(R.id.search_button);
        searchText = view.findViewById(R.id.stock_search_box);
        RecyclerView recyclerView = view.findViewById(R.id.search_recycler);
        searchRecycler = new SearchRecycler(this);
        recyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
        recyclerView.setAdapter(searchRecycler);
        calendarStart = view.findViewById(R.id.calendarView_start);
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.YEAR, -1);
        calendarStart.setDate(calendar.getTimeInMillis());
        model.getDate().setValue(formatDate(calendar.get(Calendar.YEAR), (calendar.get(Calendar.MONTH)),
                calendar.get(Calendar.DAY_OF_MONTH)));
        calendarStart.setOnDateChangeListener((view1, year, month, dayOfMonth) -> {
            model.getDate().setValue(formatDate(year, month, dayOfMonth));
        });
        viewVisibility(view, false);
        searchButton.setOnClickListener(v -> {
            viewVisibility(view, true);
            Executors.newSingleThreadExecutor().execute(() -> {
                SetSearchSymbolData setSearchSymbolData = new SetSearchSymbolData();
                final ArrayList<String[]> list = setSearchSymbolData.getSearchData(searchText.getText().toString(), context);
                if (getParentFragment().getActivity() != null) {
                    getParentFragment().requireActivity().runOnUiThread(() -> {
                        if (list.size() < 1) {
                            Toast.makeText(getContext(), "No Results", Toast.LENGTH_SHORT).show();
                            viewVisibility(view, false);
                        }
                        searchRecycler.setSearchList(list, false);
                    });
                }
            });
        });
    }

    // Format the date to be used in the API call
    public String formatDate(int year, int month, int dayOfMonth) {
        String date;
        if (month + 1 < 10) {
            date = year + "-0" + (month + 1) + "-" + dayOfMonth;
        } else {
            date = year + "-" + (month + 1) + "-" + dayOfMonth;
        }
        Log.i("TAG", "DATE  " + date);
        if (dayOfMonth < 10) {
            date = date.substring(0, 8) + "0" + date.substring(8);
        }
        return date;
    }

    // Show or hide the calendar based on whether the search button has been clicked
    public void viewVisibility(View v, boolean Search) {
        TextView startTV = v.findViewById(R.id.start_date_text_view);
        if (Search) {
            calendarStart.setVisibility(View.GONE);
            startTV.setVisibility(View.GONE);
        } else {
            calendarStart.setVisibility(View.VISIBLE);
            startTV.setVisibility(View.VISIBLE);
        }
    }

    // Handle the click event for a search item
    @Override
    public void onSearchItemClicked(String name, String ticker) {
        model.getName().setValue(name);
        model.getTicker().setValue(ticker);
        holderTicker = ticker;
        searchRecycler.setSearchList(null, true);
        MainActivity.blockingActionBar = true;
        FragmentManager fragmentManager = requireActivity().getSupportFragmentManager();
        Log.i("StockHostFragment", "StartSwitch");
        fragmentManager.beginTransaction()
                .replace(R.id.fragment_container_view, StockHostFragment.class,
                        null).setReorderingAllowed(true).addToBackStack(null).commit();
    }
}
