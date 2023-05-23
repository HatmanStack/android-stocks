package gemenielabs.sentiment.Recycler;

import static gemenielabs.sentiment.MainActivity.stockDao;

import android.content.Context;
import android.util.Log;
import android.util.TypedValue;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.Executors;

import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Room.WordCountDetails;

public class SingleWordCountRecycler extends RecyclerView.Adapter<SingleWordCountRecycler.StockVH> {


    private List<WordCountDetails> wordCountDetailsList = new ArrayList<>();
    private final Context mContext;
    private boolean isReal;

    public SingleWordCountRecycler(Context context) {
        mContext = context;
    }

    @NonNull
    @Override
    public SingleWordCountRecycler.StockVH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.stock_recycler, parent, false);
        return new StockVH(view);
    }


    @Override
    public void onBindViewHolder(@NonNull StockVH holder, int position) {
        if(wordCountDetailsList.size() > 0) {
            holder.date.setText(normalizeDate(wordCountDetailsList.get(position).getDate().substring(5)));
            holder.open.setText(String.valueOf(wordCountDetailsList.get(position).getPositive()));
            holder.high.setText(String.valueOf(wordCountDetailsList.get(position).getNegative()));
            String holderText = "";
            String sentiment = wordCountDetailsList.get(position).getSentiment();

            if(sentiment.equals("Positive")){
                holderText = "POS";
                holder.low.setTextColor(mContext.getColor(R.color.green));
            }else if(sentiment.equals("Neutral")) {
                holderText = "NEUT";
                holder.low.setTextColor(mContext.getColor(R.color.yellow));
            }else if(sentiment.equals("No News Data")){
                holderText = wordCountDetailsList.get(position).getSentiment();
                holder.low.setTextColor(mContext.getColor(R.color.red));
                holder.date.setVisibility(View.GONE);
                holder.high.setVisibility(View.GONE);
                holder.open.setVisibility(View.GONE);
                holder.close.setVisibility(View.GONE);
                holder.bar.setVisibility(View.GONE);
            }else {
                holderText = "NEG";
                holder.low.setTextColor(mContext.getColor(R.color.red));
            }

            double nextDouble = wordCountDetailsList.get(position).getNextDay();


            String nextString = String.format(Locale.US, "%,.2f", nextDouble*100) + "%";
            if(nextDouble == 0.0){
                if(!createPercentageGainLoss(wordCountDetailsList.get(0).getTicker(),
                        wordCountDetailsList.get(position).getDate(),0)){
                    TypedValue value = new TypedValue();
                    mContext.getTheme().resolveAttribute(android.R.attr.textColorPrimary, value, true);
                    holder.close.setTextColor(ContextCompat.getColor(mContext, value.resourceId));
                    nextString = "N/A";
                }
            }
            if(!nextString.equals("N/A")) {
                if (nextString.charAt(0) == '-') {
                    holder.close.setTextColor(mContext.getColor(R.color.red));
                    nextString = nextString.substring(1);
                } else {
                    holder.close.setTextColor(mContext.getColor(R.color.green));
                }

            }
            holder.low.setText(holderText);
            holder.close.setText(nextString);
        }
    }

    public void setSingleWordCountDetailsList(List<WordCountDetails> list){
        if(list != null){
            wordCountDetailsList = list;
            notifyDataSetChanged();
        }
    }

    public boolean createPercentageGainLoss(String ticker, String date, int time) {
        final LocalDate dateGain = LocalDate.parse(date);
        isReal = false;
        if(dateGain.isBefore(LocalDate.now())) {
            Executors.newSingleThreadExecutor().execute(new Runnable() {
                @Override
                public void run() {
                    LocalDate verbose = dateGain;
                    for (int j = 0; j < 5; j++) {
                        verbose = verbose.plusDays(1);
                        if (stockDao.getSingleStock(ticker, verbose.toString()) != null) {
                            isReal = true;
                            break;
                        } else if (j == 4) {
                            verbose = LocalDate.parse(date);
                        }
                    }

                    double change = stockDao.getSingleStock(ticker, verbose.toString()).getClose() -
                            stockDao.getSingleStock(ticker, date).getClose();
                    double finalChange = change / stockDao.getSingleStock(ticker, verbose.toString()).getClose();

                    List<WordCountDetails> wordCountDetails = stockDao.getWordCountDetailsDate(ticker, date);
                    for (WordCountDetails wordCountDetails1 : wordCountDetails) {

                        wordCountDetails1.setNextDay(finalChange);
                        stockDao.insertWordCountContent(wordCountDetails1);
                    }

                }
            });
        }return isReal;

    }


    public String normalizeDate(String string){
        String[] splitString = string.split("");
        if(splitString[3].equals("0")){
            string = string.substring(0,3) + string.substring(4);
        }
        if(splitString[0].equals("0")){
            string = string.substring(1);
        }
        return string;
    }


    @Override
    public int getItemCount() {
        if (wordCountDetailsList == null) {
            return 0;
        }
        Log.i("TAG", "WordCountDetails");
        return wordCountDetailsList.size();
    }

    static class StockVH extends RecyclerView.ViewHolder{

        TextView date;
        TextView open;
        TextView high;
        TextView low;
        TextView close;
        TextView volume;
        ImageView bar;

        public StockVH(View itemView) {
            super(itemView);
            date = itemView.findViewById(R.id.data_date);
            open = itemView.findViewById(R.id.data_open);
            high = itemView.findViewById(R.id.data_high);
            low = itemView.findViewById(R.id.data_low);
            close = itemView.findViewById(R.id.data_close);
            bar = itemView.findViewById(R.id.imageView);

            volume = itemView.findViewById(R.id.data_volume);
            volume.setVisibility(View.GONE);

        }
    }
}