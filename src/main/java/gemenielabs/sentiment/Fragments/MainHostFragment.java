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

/**
 * This class represents the main host fragment of the application.
 */
public class MainHostFragment extends Fragment {

    /**
     * This method inflates the layout for the main host fragment and sets the options menu.
     * @param inflater The LayoutInflater object that can be used to inflate any views in the fragment.
     * @param container The parent view that the fragment's UI should be attached to.
     * @param savedInstanceState This fragment is being re-constructed from a previous saved state as given here.
     * @return Returns the inflated view for the main host fragment.
     */
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        setHasOptionsMenu(true);
        return inflater.inflate(R.layout.main_host_fragment, container, false);
    }

    /**
     * This method sets up the main fragment collection adapter and the view pager for the main host fragment.
     * @param view The view returned by onCreateView().
     * @param savedInstanceState This fragment is being re-constructed from a previous saved state as given here.
     */
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        MainFragmentCollectionAdapter mainFragmentCollectionAdapter = new MainFragmentCollectionAdapter(this);
        ViewPager2 viewPager = view.findViewById(R.id.main_pager);
        viewPager.setPageTransformer(new ZoomOutPageTransformer());
        viewPager.setAdapter(mainFragmentCollectionAdapter);
    }

}