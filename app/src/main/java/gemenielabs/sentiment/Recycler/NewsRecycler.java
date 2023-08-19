package gemenielabs.sentiment.Recycler;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Room.NewsDetails;


public class NewsRecycler extends RecyclerView.Adapter<NewsRecycler.StockVH> {


    private List<NewsDetails> newsDetailsList;
    private final searchClickListener msearchClickListener;

    public NewsRecycler(searchClickListener listener) {
        msearchClickListener = listener;
    }

    @NonNull
    @Override
    public NewsRecycler.StockVH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.news_recycler, parent, false);
        return new NewsRecycler.StockVH(view);
    }

    @Override
    public void onBindViewHolder(@NonNull StockVH holder, int position) {
        holder.date.setText(newsDetailsList.get(position).getArticleDate());
        holder.title.setText(newsDetailsList.get(position).getTitle());
        holder.title.setTag(newsDetailsList.get(position).getAddress());
    }

    public interface searchClickListener {
        void onSearchItemClicked(String tag);
    }

    public void setNewsDetailsList(List<NewsDetails> list){
        if(list != null){
            newsDetailsList = list;
            notifyDataSetChanged();
        }
    }

    @Override
    public int getItemCount() {
        if (newsDetailsList == null) {
            return 0;
        }
        return newsDetailsList.size();
    }

    class StockVH extends RecyclerView.ViewHolder implements View.OnClickListener {

        TextView title;
        TextView date;

        public StockVH(View itemView) {
            super(itemView);
            title = itemView.findViewById(R.id.news_article);
            date = itemView.findViewById(R.id.news_date);
            title.setOnClickListener(this);
        }

        @Override
        public void onClick(View v) {
            msearchClickListener.onSearchItemClicked(title.getTag().toString());
        }
    }
}