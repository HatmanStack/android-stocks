package gemenielabs.sentiment.Fragments;

import static android.content.Context.LAYOUT_INFLATER_SERVICE;
import static gemenielabs.sentiment.MainActivity.stockDao;
import static gemenielabs.sentiment.MainActivity.blockingActionBar;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.PopupWindow;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.Executors;

import gemenielabs.sentiment.DataProcessing.SetPortfolioData;
import gemenielabs.sentiment.Helper.PriceLiveData;
import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Recycler.PortfolioRecycler;
import gemenielabs.sentiment.Room.PortfolioDetails;

/**
 * PortfolioFragment is a fragment that displays the user's portfolio of stocks.
 * It implements PortfolioRecycler.PorfolioClickListener to handle clicks on portfolio items.
 */
public class PortfolioFragment extends Fragment implements PortfolioRecycler.PorfolioClickListener {

    private PriceLiveData model;
    private String currentName, currentTicker;
    private Button portfolioButton;
    private ProgressBar progressBar;
    private View fragmentView;
    private RecyclerView recyclerView;
    private PortfolioRecycler portfolioRecycler;

    /**
     * Creates a new instance of PortfolioFragment.
     *
     * @return A new instance of PortfolioFragment.
     */
    public static PortfolioFragment newInstance() {
        return new PortfolioFragment();
    }

    /**
     * Inflates the layout for the fragment.
     *
     * @param inflater           The LayoutInflater object that can be used to inflate any views in the fragment.
     * @param container          If non-null, this is the parent view that the fragment's UI should be attached to.
     * @param savedInstanceState If non-null, this fragment is being re-constructed from a previous saved state as given here.
     * @return The inflated view for the fragment.
     */
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.portfolio_fragment, container, false);
    }

    /**
     * Initializes the views and sets up the LiveData observers.
     *
     * @param view               The view returned by onCreateView.
     * @param savedInstanceState If non-null, this fragment is being re-constructed from a previous saved state as given here.
     */
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        setViews(view);
        if(getActivity() != null){
            Context context = getActivity();
            LocalDate date = LocalDate.now();
            SharedPreferences sharedPreferences = context.getSharedPreferences("gemenielabs.sentiment.Fragments", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = sharedPreferences.edit();
            if(sharedPreferences.getString("DATE","").equals("")){
                editor.putString("DATE",date.toString());
                editor.apply();
            }
            LocalDate previousDate = LocalDate.parse(sharedPreferences.getString("DATE", LocalDate.now().toString()));
            if(date.isAfter(previousDate)){
                editor.putString("DATE", date.toString());
                editor.apply();
                updateData(true);
                fragmentExplainer();
            }
        }
        Executors.newSingleThreadExecutor().execute(() -> {
            changeVisibility(true);
            final List<PortfolioDetails> list = stockDao.getPortfolioDetails();
            getActivity().runOnUiThread(() -> model.getPortfolioDetails().setValue(list));
        });
        model.getPortfolioDetails().observe(getViewLifecycleOwner(), portfolioDetails ->{
            changeVisibility(false);
            portfolioRecycler.setPortfolioList(portfolioDetails);
        });
        model.getName().observe(getViewLifecycleOwner(), string -> currentName = string);
        model.getTicker().observe(getViewLifecycleOwner(), string -> currentTicker = string);
        portfolioButton.setOnClickListener(v -> {
            fragmentExplainer();
            if (currentTicker != null) {
                Executors.newSingleThreadExecutor().execute(() -> {
                    if (!stockDao.getWordCountDetails(currentTicker).get(0).getSentiment().equals("No News Data")) {
                        updateData(false);
                    }
                });
            }
        });
    }

    /**
     * Initializes the views for the fragment.
     *
     * @param view The view returned by onCreateView.
     */
    public void setViews(View view){
        model = new ViewModelProvider(requireActivity()).get(PriceLiveData.class);
        fragmentView = view;
        recyclerView = view.findViewById(R.id.portfolio_recycler);
        progressBar = view.findViewById(R.id.portfolio_progressbar);
        portfolioButton = view.findViewById(R.id.portfolio_button);
        recyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
        portfolioRecycler = new PortfolioRecycler(getContext(), this);
        recyclerView.setAdapter(portfolioRecycler);
    }

    /**
     * Displays a message to the user explaining the functionality of the fragment.
     */
    public void fragmentExplainer(){
        Toast.makeText(getContext(), "Number Indicates Accuracy of Model", Toast.LENGTH_LONG).show();
        Toast.makeText(getContext(), "Updating", Toast.LENGTH_LONG).show();
    }

    /**
     * Updates the data for the current stock.
     *
     * @param updating Whether the data is being updated or not.
     */
    public void updateData(Boolean updating){
        blockingActionBar = true;
        Executors.newSingleThreadExecutor().execute(() -> {
            SetPortfolioData setPortfolioData = new SetPortfolioData();
            Fragment fragment = getParentFragment();
            List<PortfolioDetails> portfolioDetails;
            if(fragment == null) {
                portfolioDetails = setPortfolioData.setPortfolioData(updating, currentName, currentTicker, getActivity());
                final List<PortfolioDetails> deets = portfolioDetails;
                if(isAdded()) {
                    requireActivity().runOnUiThread(() -> model.getPortfolioDetails().setValue(deets));
                }
            }
        });
    }

    /**
     * Changes the visibility of the views based on the loading state.
     *
     * @param visible Whether the views should be visible or not.
     */
    public void changeVisibility(boolean visible){
        try {
            recyclerView.setVisibility(visible ? View.GONE : View.VISIBLE);
            portfolioButton.setVisibility(visible ? View.GONE : View.VISIBLE);
            progressBar.setVisibility(visible ? View.VISIBLE : View.GONE);
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    /**
     * Handles clicks on portfolio items.
     *
     * @param name   The name of the stock.
     * @param ticker The ticker symbol of the stock.
     */
    @Override
    public void porfolioClickListener(String name, String ticker) {
        LayoutInflater inflater = (LayoutInflater) requireActivity().getSystemService(LAYOUT_INFLATER_SERVICE);
        View popupView = inflater.inflate(R.layout.popup, null);
        int width = LinearLayout.LayoutParams.WRAP_CONTENT;
        int height = LinearLayout.LayoutParams.WRAP_CONTENT;
        PopupWindow popupWindow = new PopupWindow(popupView, width, height, true);
        popupWindow.showAtLocation(fragmentView, Gravity.CENTER, 0, 0);
        Button delete_button = popupView.findViewById(R.id.delete_button);
        Button ticker_textview = popupView.findViewById(R.id.ticker_textView);
        String stockString = name + "\n" + ticker;
        ticker_textview.setText(stockString);

        delete_button.setOnClickListener(v -> {
            Executors.newSingleThreadExecutor().execute(() -> {
                stockDao.deleteByStockDetails(stockDao.getStockDetails(ticker));
                stockDao.deleteByNewsDetails(stockDao.getNewsDetails(ticker));
                stockDao.deleteByWordCountDetails(stockDao.getWordCountDetails(ticker));
                stockDao.deleteByCombinedWordDetails(stockDao.getCombinedWordDetails(ticker));
                stockDao.deleteByPortfolioDetails(stockDao.getSinglePortfolioDetails(ticker));
                stockDao.deleteBySymbolDetails(stockDao.getSingleSymbolDetails(ticker));
                List<PortfolioDetails> list = stockDao.getPortfolioDetails();
                requireActivity().runOnUiThread(() -> {
                    model.getPortfolioDetails().setValue(list);
                    popupWindow.dismiss();
                });
            });
        });
    }
}