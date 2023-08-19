package gemenielabs.sentiment.Recycler;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import gemenielabs.sentiment.Fragments.PortfolioFragment;
import gemenielabs.sentiment.Fragments.SearchFragment;
import gemenielabs.sentiment.Fragments.StockHostFragment;

public class MainFragmentCollectionAdapter extends FragmentStateAdapter {




    public MainFragmentCollectionAdapter(Fragment fragment) {
        super(fragment);
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        // Return a NEW fragment instance in createFragment(int)
        Fragment fragment;
        if(position == 0){
            fragment = new SearchFragment();
        }else if(position == 1){
            fragment = new StockHostFragment();
        }else {
            fragment = new PortfolioFragment();
        }
        return fragment;
    }


    @Override
    public int getItemCount() {
        return 3;
    }
}