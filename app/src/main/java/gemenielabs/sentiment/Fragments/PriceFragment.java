package gemenielabs.sentiment.Fragments;

import static gemenielabs.sentiment.MainActivity.blockingActionBar;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;

import gemenielabs.sentiment.DataProcessing.SetCombineWordCountData;
import gemenielabs.sentiment.DataProcessing.SetDailySymbolData;
import gemenielabs.sentiment.DataProcessing.SetNewsData;
import gemenielabs.sentiment.DataProcessing.SetStockPriceData;
import gemenielabs.sentiment.DataProcessing.SetWordCountData;
import gemenielabs.sentiment.Helper.PriceLiveData;
import gemenielabs.sentiment.MainActivity;
import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Recycler.StockRecycler;
import gemenielabs.sentiment.Room.CombinedWordDetails;
import gemenielabs.sentiment.Room.NewsDetails;
import gemenielabs.sentiment.Room.StockDetails;
import gemenielabs.sentiment.Room.SymbolDetails;
import gemenielabs.sentiment.Room.WordCountDetails;

/**
 * This class represents a fragment that displays stock prices and related information.
 */
public class PriceFragment extends Fragment {

    // ArrayLists to store TextViews for stock symbols and their corresponding information
    private final ArrayList<TextView> symbolViews = new ArrayList<>();
    private final ArrayList<TextView> textViews = new ArrayList<>();

    // LiveData object to store stock price data
    private PriceLiveData model;
    private Context context;

    // String to store the current date
    private String currentDate;

    /**
     * Returns a new instance of the PriceFragment.
     */
    public static PriceFragment newInstance() {
        return new PriceFragment();
    }

    /**
     * Inflates the layout for the PriceFragment.
     */
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        context = getActivity().getApplicationContext();
        return inflater.inflate(R.layout.price_fragment, container, false);
    }

    /**
     * Initializes the views and sets up the LiveData observers for the PriceFragment.
     */
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        assert getParentFragment() != null;

        // Create a new StockRecycler object and set up the RecyclerView
        StockRecycler stockRecycler = new StockRecycler(getParentFragment().getActivity());
        int[] hard = {R.id.stock_symbol, R.id.stock_name, R.id.stock_marketexchange, R.id.stock_ipoyear};
        for (int c : hard) {
            symbolViews.add(view.findViewById(c));
        }

        // Get the PriceLiveData object from the ViewModelProvider
        model = new ViewModelProvider(requireActivity()).get(PriceLiveData.class);

        // Set up the RecyclerView
        RecyclerView recyclerView = view.findViewById(R.id.stock_recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
        recyclerView.setAdapter(stockRecycler);

        // Set up the LiveData observers for the PriceFragment
        model.getDate().observe(getViewLifecycleOwner(), string ->{
                currentDate = string;
        });
        model.getTicker().observe(getViewLifecycleOwner(), this::setSymbolData);
        model.getPrice().observe(getViewLifecycleOwner(), stockRecycler::setPrice);
    }

    /**
     * Sets the stock symbol data for the PriceFragment.
     */
    public void setSymbolData(String args){
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            @Override
            public void run() {
                // Create new SetDailySymbolData, SetStockPriceData, and SetNewsData objects
                SetDailySymbolData symbolData = new SetDailySymbolData();
                final SymbolDetails deets = symbolData.setDailySymbolData(args, context);
                SetStockPriceData data = new SetStockPriceData();

                final List<StockDetails> stockDetails = data.getPriceData(args, currentDate, context);
                SetNewsData newsData = new SetNewsData();
                final List<NewsDetails> newsdeets = newsData.setNewsData(args, stockDetails, context);

                // Log the size of the newsdeets list
                Log.i("TAG_Price_Fragment_newsdeets:  ", " " + newsdeets.size());

                // Get the word count data for the newsdeets list
                getWordCountData(args, newsdeets);

                if(getParentFragment() != null) {
                    getParentFragment().requireActivity().runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            // Set the LiveData values for the PriceFragment
                            model.getPrice().setValue(stockDetails);
                            model.getName().setValue(deets.getName());
                            model.getDescription().setValue(deets.getLongDescription());
                            symbolViews.get(0).setText(deets.getTicker());
                            if (deets.getName().length() > 20) {
                                symbolViews.get(1).setText(deets.getName().substring(0, 20));
                            } else {
                                symbolViews.get(1).setText(deets.getName());
                            }
                            symbolViews.get(3).setText(deets.getStartDate());
                            symbolViews.get(2).setText(deets.getExchangeCode());
                            model.getNewsContent().setValue(newsdeets);
                        }
                    });
                }
            }
        });
    }

    /**
     * Gets the word count data for the newsdeets list.
     */
    public void getWordCountData(String args, List<NewsDetails> list){
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            @Override
            public void run() {
                // Create new SetWordCountData and SetCombineWordCountData objects
                SetWordCountData wordCountData = new SetWordCountData();
                if(getParentFragment() != null) {

                    final List<WordCountDetails> words = wordCountData.setWordCountData(args, list,
                            getParentFragment().getActivity());
                    SetCombineWordCountData setCombineWordCountData = new SetCombineWordCountData();
                    final List<CombinedWordDetails> combinedWordDetails = setCombineWordCountData.combineDates(words);
                    getParentFragment().requireActivity().runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            // Set the LiveData values for the PriceFragment
                            model.getCombinedWordDetails().setValue(combinedWordDetails);
                            model.getWordCountContent().setValue(words);
                            Log.i("TAG_pricefragment_getwordcountdata_List_size:  ", "" + list.size() + " " + words.size());
                            if((words.size()%8 == 0) && (list.size() != words.size())){
                                getWordCountData(args, list);
                                Toast.makeText(getContext(), "Sentiment Analysis Being Performed", Toast.LENGTH_SHORT).show();
                            }
                        }
                    });
                }
            }
        });
    }
}