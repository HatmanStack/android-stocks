package gemenielabs.sentiment.Fragments;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import gemenielabs.sentiment.Helper.PriceLiveData;
import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Recycler.NewsRecycler;

/**
 * This class represents a fragment that displays news content.
 */
public class NewsFragment extends Fragment implements NewsRecycler.searchClickListener {

    /**
     * Creates a new instance of the NewsFragment.
     * @return a new instance of the NewsFragment.
     */
    public static NewsFragment newInstance() {
        return new NewsFragment();
    }

    /**
     * Inflates the layout for the NewsFragment.
     * @param inflater the LayoutInflater object that can be used to inflate any views in the fragment.
     * @param container the parent view that the fragment's UI should be attached to.
     * @param savedInstanceState the saved state of the fragment.
     * @return the inflated view for the NewsFragment.
     */
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.news_fragment, container, false);
    }

    /**
     * Sets up the NewsRecycler and observes the news content.
     * @param view the view returned by onCreateView.
     * @param savedInstanceState the saved state of the fragment.
     */
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        PriceLiveData model = new ViewModelProvider(requireActivity()).get(PriceLiveData.class);
        RecyclerView recyclerView = view.findViewById(R.id.news_recycler);
        NewsRecycler newsRecycler = new NewsRecycler(this);
        recyclerView.setLayoutManager(new LinearLayoutManager(getActivity()));
        recyclerView.setAdapter(newsRecycler);
        model.getNewsContent().observe(getViewLifecycleOwner(), newsRecycler::setNewsDetailsList);
    }

    /**
     * Handles the click event for a search item in the NewsRecycler.
     * @param tag the tag associated with the clicked search item.
     */
    @Override
    public void onSearchItemClicked(String tag) {
        Uri webpage = Uri.parse(tag);
        Intent intent = new Intent(Intent.ACTION_VIEW, webpage);
        if (intent.resolveActivity(requireActivity().getPackageManager()) != null) {
            startActivity(intent);
        }
    }
}