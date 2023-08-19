package gemenielabs.sentiment.Recycler;

import android.content.Context;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Room.StockDetails;


public class StockRecycler extends RecyclerView.Adapter<StockRecycler.StockVH> {


    private List<StockDetails> stockList;
    private final Context mContext;

    public StockRecycler(Context context) {
        mContext = context;
    }

    @NonNull
    @Override
    public StockRecycler.StockVH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.price_recycler, parent, false);
        return new StockVH(view);
    }

    @Override
    public void onBindViewHolder(@NonNull StockVH holder, int position) {
        int gain = (position == stockList.size() - 1) ? 0 : 1;
        StockDetails stock = stockList.get(position);
        String dateString = stock.getDate();
        
        // Set normalized date string
        holder.date.setText(normalizeDate(dateString.substring(5)));
        
        if (position < stockList.size()) {
            // Set text color based on close and open values comparison
            holder.close.setTextColor(getTextColor(stock.getClose(), stockList.get(position + gain).getClose()));
            holder.open.setTextColor(getTextColor(stock.getOpen(), stockList.get(position + gain).getOpen()));
        }
        
        holder.close.setText(normalize(stock.getClose()));
        holder.open.setText(normalize(stock.getOpen()));
        holder.volume.setText(String.valueOf(stock.getVolume()));
    }
    
    private int getTextColor(double currentValue, double nextValue) {
        // Return color based on value comparison
        return (currentValue > nextValue) ? mContext.getColor(R.color.green) : mContext.getColor(R.color.red);
    }
    
    public String normalize(double number) {
        String string = String.valueOf(number);
        String[] splitString = string.split("\\.");
        
        // Append trailing zero if necessary
        if (splitString[1].length() == 1) {
            string = string + "0";
        }
        
        return string;
    }
    
    public String normalizeDate(String string) {
        String[] splitString = string.split("");
        
        // Remove leading zero from month if present
        if (splitString[3].equals("0")) {
            string = string.substring(0, 3) + string.substring(4);
        }
        
        // Remove leading zero from day if present
        if (splitString[0].equals("0")) {
            string = string.substring(1);
        }
        
        return string;
    }
    
    public void setPrice(List<StockDetails> list) {
        if (list != null) {
            stockList = list;
            notifyDataSetChanged();
        }
    }
    

    @Override
    public int getItemCount() {
        if (stockList == null) {
            return 0;
        }
        return stockList.size();
    }

    static class StockVH extends RecyclerView.ViewHolder{

        TextView date;
        TextView open;
        TextView high;
        TextView low;
        TextView close;
        TextView volume;

        public StockVH(View itemView) {
            super(itemView);
            high = itemView.findViewById(R.id.price_high);
            volume = itemView.findViewById(R.id.price_volume);
            date = itemView.findViewById(R.id.price_date);
            close = itemView.findViewById(R.id.price_close);
            low = itemView.findViewById(R.id.price_low);
            open = itemView.findViewById(R.id.price_open);
            high.setVisibility(View.GONE);
            low.setVisibility(View.GONE);

        }
    }
}