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
import java.time.format.DateTimeFormatter;
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
        if(wordCountDetailsList.size() > 0) {
            if (wordCountDetailsList.get(position).getSentiment().equals("No News Data")) {
                holder.open.setText(wordCountDetailsList.get(position).getSentiment());
                holder.date.setVisibility(View.GONE);
                holder.high.setVisibility(View.GONE);
                holder.low.setVisibility(View.GONE);
                holder.close.setVisibility(View.GONE);
                holder.bar.setVisibility(View.GONE);
            }
            TextView[] textViews = new TextView[]{holder.high, holder.low, holder.close};
            holder.date.setText(normalizeDate(wordCountDetailsList.get(position).getDate().substring(5)));

            String sent = wordCountDetailsList.get(position).getSentiment();
            if (sent.equals("POS")) {
                holder.open.setTextColor(mContext.getColor(R.color.green));
            } else if (sent.equals("NEUT")) {
                holder.open.setTextColor(mContext.getColor(R.color.yellow));
            } else {
                holder.open.setTextColor(mContext.getColor(R.color.red));
            }
            holder.open.setText(wordCountDetailsList.get(position).getSentiment());

            double nextDay = wordCountDetailsList.get(position).getNextDay();
            double twoWks = wordCountDetailsList.get(position).getTwoWks();
            double oneMnth = wordCountDetailsList.get(position).getOneMnth();
            double[] doubles = new double[]{nextDay, twoWks, oneMnth};
            int plusDays = 1;
            for (int i = 0; i < 3; i++) {
                String nextString = String.format(Locale.US, "%,.2f", doubles[i] * 100) + "%";

                if (i == 1) {
                    plusDays = 14;
                } else if (i == 2) {
                    plusDays = 28;
                }
                createPercentageGainLoss(wordCountDetailsList.get(0).getTicker(),
                        wordCountDetailsList.get(position).getDate(), plusDays);
                if (doubles[i] == 0.0) {
                    TypedValue value = new TypedValue();
                    mContext.getTheme().resolveAttribute(android.R.attr.textColorPrimary, value, true);
                    textViews[i].setTextColor(ContextCompat.getColor(mContext, value.resourceId));
                    nextString = "N/A";
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
        }


    public void setWordCountDetailsList(List<CombinedWordDetails> list){
        if(list != null){
            wordCountDetailsList = list;
            notifyDataSetChanged();
        }
    }

    public void createPercentageGainLoss(String ticker, String date, int time) {
        String articleDate = date.replace("-", "");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        LocalDate today = LocalDate.now();
        String dateToday = today.format(formatter);
        LocalDate comparedDate = LocalDate.parse(articleDate, formatter);
        LocalDate futureDate = comparedDate.plusDays(time);

        if(dateToday.compareTo(futureDate.toString()) > 0) {
            Executors.newSingleThreadExecutor().execute(() -> {
                Double currentPrice = null;
                LocalDate findDate = LocalDate.parse(futureDate.toString());
                for (int j = 0; j < 7; j++) {
                    findDate = findDate.plusDays(j);
                    if (stockDao.getSingleStock(ticker, findDate.toString()) != null) {
                        currentPrice = stockDao.getSingleStock(ticker, findDate.toString()).getClose();
                        break;
                    }
                    if(j == 6){
                        return ;
                    }
                }

                double change = stockDao.getSingleStock(ticker, comparedDate.toString()).getClose() - currentPrice;
                double finalChange = change / stockDao.getSingleStock(ticker, comparedDate.toString()).getClose();
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
