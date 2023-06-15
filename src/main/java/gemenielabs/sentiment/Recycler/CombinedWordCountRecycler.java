package gemenielabs.sentiment.Recycler;


import static gemenielabs.sentiment.MainActivity.stockDao;

import android.content.Context;
import android.icu.text.DecimalFormat;
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
import gemenielabs.sentiment.Room.CombinedWordDetails;

public class CombinedWordCountRecycler extends RecyclerView.Adapter<CombinedWordCountRecycler.StockVH> {


    private List<CombinedWordDetails> wordCountDetailsList = new ArrayList<>();
    private final Context mContext;
    private boolean isReal;


    public CombinedWordCountRecycler(Context context) {
        mContext = context;
    }

    @NonNull
    @Override
    public CombinedWordCountRecycler.StockVH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.stock_recycler, parent, false);
        return new StockVH(view);
    }

    @Override
    public void onBindViewHolder(@NonNull StockVH holder, int position) {
        if (wordCountDetailsList.size() > 0) {
            WordCountDetails details = wordCountDetailsList.get(position);
            
            // Check if sentiment is "No News Data"
            if (details.getSentiment().equals("No News Data")) {
                // Set views to be hidden
                setViewsVisibility(holder, View.GONE);
                holder.open.setText(details.getSentiment());
            } else {
                // Set views to be visible
                setViewsVisibility(holder, View.VISIBLE);
                
                // Set sentiment text and color
                setSentimentText(holder, details);
                
                // Set date text
                holder.date.setText(normalizeDate(details.getDate().substring(5)));
                
                // Set percentage values and text color
                setPercentageValues(holder, details);
            }
        }
    }
    
    // Helper method to set the visibility of multiple views
    private void setViewsVisibility(StockVH holder, int visibility) {
        holder.date.setVisibility(visibility);
        holder.high.setVisibility(visibility);
        holder.low.setVisibility(visibility);
        holder.close.setVisibility(visibility);
        holder.bar.setVisibility(visibility);
    }
    
    // Helper method to set sentiment text and color
    private void setSentimentText(StockVH holder, WordCountDetails details) {
        holder.open.setText(details.getSentiment());
        
        String sentiment = details.getSentiment();
        int colorResId;
        
        if (sentiment.equals("POS")) {
            colorResId = R.color.green;
        } else if (sentiment.equals("NEUT")) {
            colorResId = R.color.yellow;
        } else {
            colorResId = R.color.red;
        }
        
        holder.open.setTextColor(mContext.getColor(colorResId));
    }
    
    // Helper method to set percentage values and text color
    private void setPercentageValues(StockVH holder, WordCountDetails details) {
        double[] values = {details.getNextDay(), details.getTwoWks(), details.getOneMnth()};
        TextView[] textViews = {holder.high, holder.low, holder.close};
        
        for (int i = 0; i < 3; i++) {
            double value = values[i];
            String nextString = String.format(Locale.US, "%,.2f", value * 100) + "%";
            
            if (value == 0.0) {
                int plusDays = getPlusDays(i);
                
                if (!createPercentageGainLoss(wordCountDetailsList.get(0).getTicker(),
                        details.getDate(), plusDays)) {
                    TypedValue typedValue = new TypedValue();
                    mContext.getTheme().resolveAttribute(android.R.attr.textColorPrimary, typedValue, true);
                    textViews[i].setTextColor(ContextCompat.getColor(mContext, typedValue.resourceId));
                    nextString = "N/A";
                }
            }
            
            if (nextString.charAt(0) == '-') {
                textViews[i].setTextColor(mContext.getColor(R.color.red));
                nextString = nextString.substring(1);
            } else if (!nextString.equals("N/A")) {
                textViews[i].setTextColor(mContext.getColor(R.color.green));
            }
            
            textViews[i].setText(nextString);
        }
    }
    
    // Helper method to determine the number of plus days based on the index
    private int getPlusDays(int index) {
        int plusDays = 0;
        
        if (index == 1) {
            plusDays = 14;
        } else if (index == 2) {
            plusDays = 28;
        }
        
        return plusDays;
    }
    
    public void setWordCountDetailsList(List<CombinedWordDetails> list) {
        if (list != null) {
            wordCountDetailsList = list;
            notifyDataSetChanged();
        }
    }
    
    public boolean createPercentageGainLoss(String ticker, String date, int time) {
        LocalDate dateGain = LocalDate.parse(date);
        final LocalDate finalDateGain = dateGain.plusDays(time);
        isReal = false;
        
        if (finalDateGain.isBefore(LocalDate.now())) {
            Executors.newSingleThreadExecutor().execute(() -> {
                LocalDate verbose = finalDateGain;
                
                for (int j = 0; j < 5; j++) {
                    verbose = verbose.plusDays(1);
                    
                    if (stockDao.getSingleStock(ticker, verbose.toString()) != null) {
                        isReal = true;
                        break;
                    } else if (j == 4) {
                        verbose = LocalDate.parse(date);
                    }
                }
                
                Stock stock = stockDao.getSingleStock(ticker, verbose.toString());
                double change = stock.getClose() - stockDao.getSingleStock(ticker, date).getClose();
                double finalChange = change / stock.getClose();
                
                CombinedWordDetails combinedWordDetails = stockDao.getCombinedWordDetailsDate(ticker, date);
                
                if (time == 0) {
                    combinedWordDetails.setNextDay(finalChange);
                } else if (time == 14) {
                    combinedWordDetails.setTwoWks(finalChange);
                } else if (time == 28) {
                    combinedWordDetails.setOneMnth(finalChange);
                }
                
                stockDao.insertCombinedWordDetails(combinedWordDetails);
            });
        }
        
        return isReal;
    }
    
    public String normalizeDate(String string) {
        String[] splitString = string.split("");
        
        if (splitString[3].equals("0")) {
            string = string.substring(0, 3) + string.substring(4);
        }
        
        if (splitString[0].equals("0")) {
            string = string.substring(1);
        }
        
        return string;
    }

    @Override
    public int getItemCount() {
        if (wordCountDetailsList == null) {
            return 0;
        }

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
            volume = itemView.findViewById(R.id.data_volume);
            bar = itemView.findViewById(R.id.imageView);
            volume.setVisibility(View.GONE);

        }
    }
}