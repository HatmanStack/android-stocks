package gemenielabs.sentiment.Fragments;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.time.LocalDate;

import gemenielabs.sentiment.Helper.PriceLiveData;
import static gemenielabs.sentiment.MainActivity.blockingActionBar;
import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Recycler.CombinedWordCountRecycler;
import gemenielabs.sentiment.Recycler.SingleWordCountRecycler;


public class WordCountFragment extends Fragment {

    RecyclerView recyclerView;
    RecyclerView singleRecyclerView;
    private ProgressBar progressBar;
    private TextView description;
    private TextView moreLess;


    public static WordCountFragment newInstance() {
        return new WordCountFragment();
    }


    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.word_count_fragment, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        PriceLiveData model = new ViewModelProvider(requireActivity()).get(PriceLiveData.class);
        recyclerView = view.findViewById(R.id.word_count_recycler);
        recyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
        singleRecyclerView = view.findViewById(R.id.single_recyclerview);
        progressBar = view.findViewById(R.id.progress_circular);
        singleRecyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
        assert getParentFragment() != null;
        CombinedWordCountRecycler combinedWordCountRecycler = new CombinedWordCountRecycler( getParentFragment().getActivity());
        SingleWordCountRecycler singleWordCountRecycler = new SingleWordCountRecycler( getParentFragment().getActivity());
        singleRecyclerView.setAdapter(singleWordCountRecycler);
        recyclerView.setAdapter(combinedWordCountRecycler);
        TextView title = view.findViewById(R.id.word_count_title);
        description = view.findViewById(R.id.word_count_description);
        moreLess = view.findViewById(R.id.more_less);
        changeVisibility(true);
        moreLess.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                setUpDescription(v);
            }
        });
        model.getName().observe(getViewLifecycleOwner(), title::setText);
        model.getDescription().observe(getViewLifecycleOwner(), string ->{
            description.setText(string);
            description.setPadding(50,0,0,0);
        });
        model.getWordCountContent().observe(getViewLifecycleOwner(), singleWordCountRecycler::setSingleWordCountDetailsList);

        model.getCombinedWordDetails().observe(getViewLifecycleOwner(), combinedWordDetails ->{
            if(combinedWordDetails != null && combinedWordDetails.size() > 0) {
                changeVisibility(!combinedWordDetails.get(0).getTicker().equals(SearchFragment.holderTicker));
                blockingActionBar = !combinedWordDetails.get(0).getTicker().equals(SearchFragment.holderTicker);
            }
            if(getActivity() != null) {
                Context context = getActivity();
                LocalDate date = LocalDate.now();
                SharedPreferences sharedPreferences = context.getSharedPreferences("gemenielabs.sentiment.Fragments", Context.MODE_PRIVATE);
                LocalDate previousDate = LocalDate.parse(sharedPreferences.getString("WORDCOUNT_DATE", LocalDate.now().toString()));
                if (date.isAfter(previousDate)) {
                    SharedPreferences.Editor editor = sharedPreferences.edit();
                    editor.putString("WORDCOUNT_DATE", date.toString());
                    editor.apply();
                    Toast.makeText(getContext(), "Historically Stock Movement From Date\n " +
                            "Sentiment Color Indicates Confidence", Toast.LENGTH_LONG).show();
                }
            }

            combinedWordCountRecycler.setWordCountDetailsList(combinedWordDetails);
        });

        Toast.makeText(getContext(), "Sentiment Analysis Being Performed", Toast.LENGTH_LONG).show();
    }

    public void setUpDescription(View v){
        int maxLines;
        if(v.getTag().equals("more")){
            moreLess.setText("LESS");
            maxLines = 100;
            v.setTag("less");
        }else {
            v.setTag("more");
            maxLines = 1;
            moreLess.setText("MORE");
        }
        description.setMaxLines(maxLines);
    }

    public void changeVisibility(boolean visible){
        try {
            if (visible) {
                progressBar.setVisibility(View.VISIBLE);
                recyclerView.setVisibility(View.INVISIBLE);
                singleRecyclerView.setVisibility(View.INVISIBLE);
            } else {
                progressBar.setVisibility(View.INVISIBLE);
                singleRecyclerView.setVisibility(View.VISIBLE);
                recyclerView.setVisibility(View.VISIBLE);
            }
        }catch (Exception e){
            e.printStackTrace();
        }
    }

}