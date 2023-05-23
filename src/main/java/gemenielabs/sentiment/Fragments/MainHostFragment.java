package gemenielabs.sentiment.Fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.viewpager2.widget.ViewPager2;

import gemenielabs.sentiment.Animations.CubeOutPageTransformer;
import gemenielabs.sentiment.Animations.FlipHorizontalPageTransformer;
import gemenielabs.sentiment.Animations.ZoomOutPageTransformer;
import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Recycler.MainFragmentCollectionAdapter;

public class MainHostFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        setHasOptionsMenu(true);
        return inflater.inflate(R.layout.main_host_fragment, container, false);

    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        MainFragmentCollectionAdapter mainFragmentCollectionAdapter = new MainFragmentCollectionAdapter(this);
        ViewPager2 viewPager = view.findViewById(R.id.main_pager);
        viewPager.setPageTransformer(new ZoomOutPageTransformer());
        viewPager.setAdapter(mainFragmentCollectionAdapter);
    }

}