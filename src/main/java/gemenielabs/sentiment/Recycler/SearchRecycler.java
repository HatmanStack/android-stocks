package gemenielabs.sentiment.Recycler;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

import gemenielabs.sentiment.R;


public class SearchRecycler extends RecyclerView.Adapter<SearchRecycler.StockVH> {


    private ArrayList<String[]> searchList;
    private final searchClickListener msearchClickListener;

    public SearchRecycler(searchClickListener listener) {
        msearchClickListener = listener;
    }

    @NonNull
    @Override
    public SearchRecycler.StockVH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.search_recycler, parent, false);
        return new SearchRecycler.StockVH(view);
    }

    @Override
    public void onBindViewHolder(@NonNull StockVH holder, int position) {
        String titleString = searchList.get(position)[0];
        if(titleString.length() > 25){
            titleString = titleString.substring(0,25);
        }
        holder.name.setText(titleString);
        holder.ticker.setText(searchList.get(position)[1]);
    }


    public interface searchClickListener {
        void onSearchItemClicked(String name, String ticker);
    }

    public void setSearchList(ArrayList<String[]> list, boolean clearList){
        if(clearList){
            searchList.clear();
        }else {
            if (list != null) {
                searchList = list;
            }
        }
        notifyDataSetChanged();
    }

    @Override
    public int getItemCount() {
        if (searchList == null) {
            return 0;
        }
        return searchList.size();
    }

    class StockVH extends RecyclerView.ViewHolder implements View.OnClickListener {

        TextView name;
        TextView ticker;

        public StockVH(View itemView) {
            super(itemView);
            name = itemView.findViewById(R.id.search_name);
            ticker = itemView.findViewById(R.id.search_ticker);
            name.setOnClickListener(this);
        }

        @Override
        public void onClick(View v) {
            msearchClickListener.onSearchItemClicked((String) name.getText(), (String) ticker.getText());
        }
    }
}