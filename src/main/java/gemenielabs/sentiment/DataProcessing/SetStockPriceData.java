package gemenielabs.sentiment.DataProcessing;

import static gemenielabs.sentiment.MainActivity.stockDao;

import android.icu.math.BigDecimal;
import android.util.Log;

import org.json.JSONArray;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

import gemenielabs.sentiment.Room.StockDetails;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
public class SetStockPriceData {



    public List<StockDetails> getPriceData(String ticker, String startDate){
        int size = stockDao.getStockDetails(ticker).size();
        //boolean priceUpdate = true;
        if(size>0){
            String firstDate = stockDao.getStockDetails(ticker).get(size-1).getDate();
            Log.i("TAG_setStockPriceData_firstDate:   ", firstDate);
            Log.i("TAG_setStockPriceData_startDate:   ", startDate);
            LocalDate x = LocalDate.parse(firstDate);
            LocalDate y = LocalDate.parse(startDate);
            if(x.isBefore(y)){
                String lastDate = stockDao.getStockDetails(ticker).get(0).getDate();
                Log.i("TAG_setStockPriceData_lastDate:   ", lastDate);
                LocalDate z = LocalDate.parse(lastDate);
                String plusDay = z.plusDays(1).toString();
                Log.i("TAG_setStockPriceData_zPlus1:   ", plusDay);
                getTiingoData(ticker,plusDay,"");
            } else{
                //priceUpdate = false;
            }
            //String lastDate = stockDao.getStockDetails(ticker).get(0).getDate();
            //Log.i("TAG_setStockPriceData_firstDate:   ", lastDate);
            //getTiingoData(ticker, lastDate, "");
        }else{
            getTiingoData(ticker,startDate, "");
        }

        return stockDao.getStockDetails(ticker);
    }

    public void getTiingoData(String ticker, String date, String newDate){
        StockDetails deets = new StockDetails(0, 0," ", 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0,
                " ", 0, 0, 0, 0, 0);
        try {
            OkHttpClient client = new OkHttpClient();
            String requestString;
            if(newDate.equals("")){
                requestString = "https://api.tiingo.com/tiingo/daily/" + ticker +
                        "/prices?startDate=" + date + "&token=<INSERT API KEY HERE>";
            }else {
                requestString = "https://api.tiingo.com/tiingo/daily/" + ticker +
                        "/prices?startDate=" + date + "&endDate=" + newDate +
                        "&token=<INSERT API KEY HERE>";
            }
            Request request = new Request.Builder()
                    .url(requestString)
                    .get()
                    .build();
            Response response = client.newCall(request).execute();
            String stringArr = Objects.requireNonNull(response.body()).string();
            JSONArray arr = new JSONArray(stringArr);
            int arrHash = arr.hashCode();
            if(arr.length() > 1) {
                for (int i = 0; i < arr.length(); i++) {
                    String dateString = arr.getJSONObject(i).getString("date");
                    String dString = dateString.substring(0, 10);
                    deets.setHash(arrHash);
                    deets.setDate(dString);
                    deets.setClose(roundIt(arr.getJSONObject(i).getDouble("close")));
                    deets.setHigh(roundIt(arr.getJSONObject(i).getDouble("high")));
                    deets.setLow(roundIt(arr.getJSONObject(i).getDouble("low")));
                    deets.setOpen(roundIt(arr.getJSONObject(i).getDouble("open")));
                    deets.setVolume(arr.getJSONObject(i).getInt("volume"));
                    deets.setTicker(ticker);
                    stockDao.insertStock(deets);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public double roundIt(Double d){
        BigDecimal bd = new BigDecimal(d).setScale(2, BigDecimal.ROUND_UP);
        return bd.doubleValue();
    }

}
