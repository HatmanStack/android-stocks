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

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.stock_host_fragment, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        StockFragmentCollectionAdapter stockFragmentCollectionAdapter = new StockFragmentCollectionAdapter(this);
        ViewPager2 viewPager = view.findViewById(R.id.pager);
        viewPager.setAdapter(stockFragmentCollectionAdapter);
        viewPager.setPageTransformer(new ZoomOutPageTransformer());
        TabLayout tabLayout = view.findViewById(R.id.tab_layout);
        String[] labels = {"Price", "Words", "News"};
        new TabLayoutMediator(tabLayout, viewPager,
                (tab, position) -> tab.setText(labels[position])
        ).attach();
        setHasOptionsMenu(true);
    }


}

