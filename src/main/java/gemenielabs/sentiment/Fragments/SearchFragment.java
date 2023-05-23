package gemenielabs.sentiment.Fragments;

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

public class SearchFragment extends Fragment implements SearchRecycler.searchClickListener{

    private EditText searchText;
    private PriceLiveData model;
    SearchRecycler searchRecycler;
    private CalendarView calendarStart;
    public static String holderTicker;
    public static OkHttpClient client = new OkHttpClient().newBuilder()
            //This Timeout is a POS you know why...Fucking POS
            .readTimeout(45, TimeUnit.SECONDS).build();


    public static SearchFragment newInstance() {
        return new SearchFragment();
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.search_fragment, container, false);
    }

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
        calendarStart.setOnDateChangeListener(new CalendarView.OnDateChangeListener() {
            @Override
            public void onSelectedDayChange(@NonNull CalendarView view, int year, int month, int dayOfMonth) {
                model.getDate().setValue(formatDate(year,month,dayOfMonth));
                }
            });
        viewVisibility(view, false);
        searchButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                viewVisibility(view, true);
                Executors.newSingleThreadExecutor().execute(new Runnable() {
                    @Override
                    public void run() {
                        SetSearchSymbolData setSearchSymbolData = new SetSearchSymbolData();
                        final ArrayList<String[]> list = setSearchSymbolData.getSearchData(searchText.getText().toString());
                        if(getParentFragment().getActivity() != null){
                            getParentFragment().requireActivity().runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    if (list.size() < 1) {
                                        Toast.makeText(getContext(), "No Results", Toast.LENGTH_SHORT).show();
                                        viewVisibility(view, false);
                                    }
                                    searchRecycler.setSearchList(list, false);
                                }
                            });
                        }
                    }
                });
            }
        });
    }

    public String formatDate(int year, int month, int dayOfMonth){
        String date = "";
        if(month+1 < 10){
            date = year + "-0"+ (month + 1) + "-" + dayOfMonth;
        }else {
            date = year + "-"+ (month + 1) + "-" + dayOfMonth;
        }
        Log.i("TAG", "DATE  " + date);
        if(dayOfMonth < 10){
            date = date.substring(0,8) + "0" + date.substring(8);
        }
        return date;
    }

    public void viewVisibility(View v, boolean Search){
        TextView startTV = v.findViewById(R.id.start_date_text_view);
        if(Search){
            calendarStart.setVisibility(View.GONE);
            startTV.setVisibility(View.GONE);
        }else {
            calendarStart.setVisibility(View.VISIBLE);
            startTV.setVisibility(View.VISIBLE);
        }
    }

    @Override
    public void onSearchItemClicked(String name, String ticker) {

        model.getName().setValue(name);
        model.getTicker().setValue(ticker);
        holderTicker = ticker;
        searchRecycler.setSearchList(null, true);
        MainActivity.blockingActionBar = true;
        FragmentManager fragmentManager = requireActivity().getSupportFragmentManager();
        fragmentManager.beginTransaction()
                .replace(R.id.fragment_container_view, StockHostFragment.class,
                        null).setReorderingAllowed(true).addToBackStack(null).commit();
    }
}
