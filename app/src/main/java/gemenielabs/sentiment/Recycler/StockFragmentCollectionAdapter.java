package gemenielabs.sentiment.Recycler;

import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import gemenielabs.sentiment.Fragments.NewsFragment;
import gemenielabs.sentiment.Fragments.PriceFragment;
import gemenielabs.sentiment.Fragments.WordCountFragment;

public class StockFragmentCollectionAdapter extends FragmentStateAdapter {


    public String startDate;
    public static final String DATE = "date";
    public StockFragmentCollectionAdapter(Fragment fragment) {
        super(fragment);
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        // Return a NEW fragment instance in createFragment(int)
        Fragment fragment;
        if(position == 0){
            fragment = new PriceFragment();
        }else if(position == 1){
            fragment = new WordCountFragment();
        }else {
            fragment = new NewsFragment();
        }
        Bundle args = new Bundle();
        args.putString(DATE, startDate);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public int getItemCount() {
        return 3;
    }
}
