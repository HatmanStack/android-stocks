package gemenielabs.sentiment.Fragments;

import static gemenielabs.sentiment.MainActivity.blockingActionBar;

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
import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Recycler.StockRecycler;
import gemenielabs.sentiment.Room.CombinedWordDetails;
import gemenielabs.sentiment.Room.NewsDetails;
import gemenielabs.sentiment.Room.StockDetails;
import gemenielabs.sentiment.Room.SymbolDetails;
import gemenielabs.sentiment.Room.WordCountDetails;

public class PriceFragment extends Fragment {

    private final ArrayList<TextView> symbolViews = new ArrayList<>();
    private final ArrayList<TextView> textViews = new ArrayList<>();
    private PriceLiveData model;
    private String currentDate;


    public static PriceFragment newInstance() {
        return new PriceFragment();
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.price_fragment, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        assert getParentFragment() != null;
        StockRecycler stockRecycler = new StockRecycler(getParentFragment().getActivity());
        int[] hard = {R.id.stock_symbol, R.id.stock_name, R.id.stock_marketexchange, R.id.stock_ipoyear};
       for (int c : hard) {
            symbolViews.add(view.findViewById(c));
        }

        model = new ViewModelProvider(requireActivity()).get(PriceLiveData.class);
        RecyclerView recyclerView = view.findViewById(R.id.stock_recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
        recyclerView.setAdapter(stockRecycler);
        model.getDate().observe(getViewLifecycleOwner(), string ->{
                currentDate = string;
        });
        model.getTicker().observe(getViewLifecycleOwner(), this::setSymbolData);
        model.getPrice().observe(getViewLifecycleOwner(), stockRecycler::setPrice);
    }

    public void setSymbolData(String args){
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            @Override
            public void run() {
                SetDailySymbolData symbolData = new SetDailySymbolData();
                final SymbolDetails deets = symbolData.setDailySymbolData(args);
                SetStockPriceData data = new SetStockPriceData();
                final List<StockDetails> stockDetails = data.getPriceData(args, currentDate);
                SetNewsData newsData = new SetNewsData();
                final List<NewsDetails> newsdeets = newsData.setNewsData(args, stockDetails);
                Log.i("TAG_Price_Fragment_newsdeets:  ", " " + newsdeets.size());
                getWordCountData(args, newsdeets);

                if(getParentFragment() != null) {
                    getParentFragment().requireActivity().runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
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

    public void getWordCountData(String args, List<NewsDetails> list){
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            @Override
            public void run() {
                SetWordCountData wordCountData = new SetWordCountData();
                if(getParentFragment() != null) {
                    final List<WordCountDetails> words = wordCountData.setWordCountData(args, list,
                            getParentFragment().getActivity());
                    SetCombineWordCountData setCombineWordCountData = new SetCombineWordCountData();
                    final List<CombinedWordDetails> combinedWordDetails = setCombineWordCountData.combineDates(words);
                    getParentFragment().requireActivity().runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
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