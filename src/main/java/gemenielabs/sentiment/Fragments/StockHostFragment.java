package gemenielabs.sentiment.Fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.widget.ViewPager2;

import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;

import gemenielabs.sentiment.Animations.CubeOutPageTransformer;
import gemenielabs.sentiment.Animations.FlipHorizontalPageTransformer;
import gemenielabs.sentiment.Animations.ZoomOutPageTransformer;
import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Recycler.StockFragmentCollectionAdapter;

public class StockHostFragment extends Fragment {

    // Inflate the layout for the fragment
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.stock_host_fragment, container, false);
    }

    // Set up the ViewPager2 and TabLayout for the fragment
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        // Create a StockFragmentCollectionAdapter object
        StockFragmentCollectionAdapter adapter = new StockFragmentCollectionAdapter(this);

        // Set the adapter for the ViewPager2
        ViewPager2 viewPager = view.findViewById(R.id.pager);
        viewPager.setAdapter(adapter);

        // Set a ZoomOutPageTransformer as the page transformer for the ViewPager2
        viewPager.setPageTransformer(new ZoomOutPageTransformer());

        // Create a TabLayoutMediator object to link the TabLayout and ViewPager2
        TabLayout tabLayout = view.findViewById(R.id.tab_layout);
        String[] labels = {"Price", "Words", "News"};
        new TabLayoutMediator(tabLayout, viewPager,
                // Set the labels for the tabs
                (tab, position) -> tab.setText(labels[position])
        ).attach();

        // Set the setHasOptionsMenu flag to true to indicate that the fragment has an options menu
        setHasOptionsMenu(true);
    }
}

