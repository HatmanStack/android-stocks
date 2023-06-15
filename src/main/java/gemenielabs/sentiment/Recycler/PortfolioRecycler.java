package gemenielabs.sentiment.Recycler;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;

import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Room.PortfolioDetails;

public class PortfolioRecycler extends RecyclerView.Adapter<PortfolioRecycler.StockVH> {


    private List<PortfolioDetails> portfolioList;
    private final Context mContext;
    private final PorfolioClickListener mPortfolioClickListener;

    public PortfolioRecycler(Context context, PorfolioClickListener listener) {
        mContext = context;
        mPortfolioClickListener = listener;
    }

    @NonNull
    @Override
    public PortfolioRecycler.StockVH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.stock_recycler, parent, false);
        return new StockVH(view);
    }


    @Override
public void onBindViewHolder(@NonNull StockVH holder, int position) {
    PortfolioItem item = portfolioList.get(position);
    
    // Set name and ticker text
    holder.name.setText(item.getName());
    holder.tick.setText(item.getTicker());
    
    TextView[] textViews = {holder.next, holder.wks, holder.mnth};
    String[] data = {item.getNext(), item.getWks(), item.getMnth()};
    
    for (int i = 0; i < textViews.length; i++) {
        String[] holderData = data[i].split(" ");
        String score = holderData[0] + "0000";
        
        // Check if score length is greater than 1
        if (holderData[0].length() > 1) {
            if (holderData[1].equals("1")) {
                // Set text color to green
                textViews[i].setTextColor(mContext.getColor(R.color.green));
            } else {
                // Set text color to red
                textViews[i].setTextColor(mContext.getColor(R.color.red));
            }
            
            // Set formatted score string
            String setString = score.substring(2, 4) + "." + score.substring(4, 6) + "%";
            textViews[i].setText(setString);
        }
    }
}


    public void setPortfolioList(List<PortfolioDetails> list) {
        if (list != null) {
            portfolioList = list;
            //Log.i("TAG",  "setPortfolioLIST" + list.get(0).getName());
            notifyDataSetChanged();
        }
    }

    public interface PorfolioClickListener {
        void porfolioClickListener(String name, String ticker);
    }

    @Override
    public int getItemCount() {
        if (portfolioList == null) {
            return 0;
        }
        return portfolioList.size();
    }

    class StockVH extends RecyclerView.ViewHolder implements View.OnClickListener {

        TextView name;
        TextView tick;
        TextView next;
        TextView wks;
        TextView mnth;
        TextView volume;

        public StockVH(View itemView) {
            super(itemView);
            name = itemView.findViewById(R.id.data_date);
            tick = itemView.findViewById(R.id.data_open);
            next = itemView.findViewById(R.id.data_high);
            wks = itemView.findViewById(R.id.data_low);
            mnth = itemView.findViewById(R.id.data_close);
            volume = itemView.findViewById(R.id.data_volume);
            volume.setVisibility(View.GONE);
            itemView.setOnClickListener(this);
        }

        @Override
        public void onClick(View v) {
            mPortfolioClickListener.porfolioClickListener((String) name.getText(), (String) tick.getText());
        }
    }
}