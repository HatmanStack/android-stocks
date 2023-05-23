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

public class PortfolioFragment extends Fragment implements PortfolioRecycler.PorfolioClickListener {

    private PriceLiveData model;
    private String currentName;
    private String currentTicker;
    private Button portfolioButton;
    private ProgressBar progressBar;
    private View fragmentView;
    private RecyclerView recyclerView;
    private PortfolioRecycler portfolioRecycler;


    public static PortfolioFragment newInstance() {
        return new PortfolioFragment();
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.portfolio_fragment, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        setViews(view);

        if(getActivity() != null){
            Context context = getActivity();
            LocalDate date = LocalDate.now();
            SharedPreferences sharedPreferences = context.getSharedPreferences("gemenielabs.sentiment.Fragments", Context.MODE_PRIVATE);
            Log.i("TAG_PortfolioFragment_date:  ", sharedPreferences.getString("DATE",""));
            SharedPreferences.Editor editor = sharedPreferences.edit();
            //editor.putString("DATE", String.valueOf(LocalDate.now().minusDays(2)));
            //editor.apply();
            //Set Initial Date
            if(sharedPreferences.getString("DATE","").equals("")){
                editor.putString("DATE",date.toString());
                editor.apply();
            }
            LocalDate previousDate = LocalDate.parse(sharedPreferences.getString("DATE", LocalDate.now().toString()));
            Log.i("TAG_PortfolioFragment_date:  ", previousDate.toString());
            if(date.isAfter(previousDate)){
                editor.putString("DATE", date.toString());
                editor.apply();
                updateData(true);
                fragmentExplainer();
            }
        }
       Executors.newSingleThreadExecutor().execute(new Runnable() {
                    @Override
                    public void run() {
                        changeVisibility(true);
                        final List<PortfolioDetails> list = stockDao.getPortfolioDetails();
                        getActivity().runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                model.getPortfolioDetails().setValue(list);
                            }
                        });
                    }
                });
        model.getPortfolioDetails().observe(getViewLifecycleOwner(), portfolioDetails ->{
            changeVisibility(false);
            portfolioRecycler.setPortfolioList(portfolioDetails);
        });
        model.getName().observe(getViewLifecycleOwner(), string ->{
            currentName = string;
        });
        model.getTicker().observe(getViewLifecycleOwner(), string ->{
            currentTicker = string;
        });
        portfolioButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                fragmentExplainer();
                if (currentTicker != null) {
                    Executors.newSingleThreadExecutor().execute(new Runnable() {
                        @Override
                        public void run() {
                            if (!stockDao.getWordCountDetails(currentTicker).get(0).getSentiment().equals("No News Data")) {
                                Log.i("TAG", "CLICK");
                                updateData(false);
                            }
                        }
                    });
                }
            }
        });
    }

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

    public void fragmentExplainer(){
        Toast.makeText(getContext(), "Number Indicates Accuracy of Model", Toast.LENGTH_LONG).show();
        Toast.makeText(getContext(), "Updating", Toast.LENGTH_LONG).show();
    }


    public void updateData(Boolean updating){
        blockingActionBar = true;
        Executors.newSingleThreadExecutor().execute(new Runnable() {
            @Override
            public void run() {
                SetPortfolioData setPortfolioData = new SetPortfolioData();
                Fragment fragment = getParentFragment();
                List<PortfolioDetails> portfolioDetails;
                Log.i("TAG", "UPDATEDATA");
                if(fragment == null) {
                    portfolioDetails = setPortfolioData.setPortfolioData(updating,
                            currentName,
                            currentTicker,
                            getActivity());
                    Log.i("TAG", "UPDATEDATA   portfoliodetails    " + portfolioDetails.size());
                    final List<PortfolioDetails> deets = portfolioDetails;
                    if(isAdded()) {
                        requireActivity().runOnUiThread(() -> {
                            Log.i("TAG", "UPDATEDATA   DEETS    " + deets.size());
                            model.getPortfolioDetails().setValue(deets);
                        });
                    }
                }
            }
        });
    }

    public void changeVisibility(boolean visible){
        try {
            if (visible) {
                recyclerView.setVisibility(View.GONE);
                portfolioButton.setVisibility(View.GONE);
                progressBar.setVisibility(View.VISIBLE);
            } else {
                progressBar.setVisibility(View.GONE);
                recyclerView.setVisibility(View.VISIBLE);
                portfolioButton.setVisibility(View.VISIBLE);
            }
        }catch (Exception e){
            e.printStackTrace();
        }

    }

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

        delete_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Executors.newSingleThreadExecutor().execute(new Runnable() {
                    @Override
                    public void run() {
                        stockDao.deleteByStockDetails(stockDao.getStockDetails(ticker));
                        stockDao.deleteByNewsDetails(stockDao.getNewsDetails(ticker));
                        stockDao.deleteByWordCountDetails(stockDao.getWordCountDetails(ticker));
                        stockDao.deleteByCombinedWordDetails(stockDao.getCombinedWordDetails(ticker));
                        stockDao.deleteByPortfolioDetails(stockDao.getSinglePortfolioDetails(ticker));
                        stockDao.deleteBySymbolDetails(stockDao.getSingleSymbolDetails(ticker));
                        List<PortfolioDetails> list = stockDao.getPortfolioDetails();
                        requireActivity().runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                model.getPortfolioDetails().setValue(list);
                                popupWindow.dismiss();
                            }
                        });
                    }
                });
            }
        });
    }
}