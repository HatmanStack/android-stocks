package gemenielabs.sentiment.DataProcessing;

import static android.provider.Settings.System.getString;
import static gemenielabs.sentiment.MainActivity.stockDao;

import android.content.Context;
import android.util.Log;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import gemenielabs.sentiment.BuildConfig;
import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Room.StockDetails;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.json.JSONArray;
import java.util.Objects;
import android.util.Log;

public class SetStockPriceData {

    // Refactored getPriceData function
    public List<StockDetails> getPriceData(String ticker, String startDate, Context context) {
        Log.i("PriceData", "Start");
        int size = stockDao.getStockDetails(ticker).size();
        if (size > 0) {
            String firstDate = stockDao.getStockDetails(ticker).get(size - 1).getDate();
            LocalDate x = LocalDate.parse(firstDate);
            LocalDate y = LocalDate.parse(startDate);
            if (x.isBefore(y)) {
                String lastDate = stockDao.getStockDetails(ticker).get(0).getDate();
                LocalDate z = LocalDate.parse(lastDate);
                String plusDay = z.plusDays(1).toString();
                getTiingoData(ticker, plusDay, "", context);
            }
        } else {
            getTiingoData(ticker, startDate, "", context);
        }
        return stockDao.getStockDetails(ticker);
    }

    // Refactored getTiingoData function
    public void getTiingoData(String ticker, String date, String newDate, Context context) {
        try {
            OkHttpClient client = new OkHttpClient();
            String requestString;
            if (newDate.equals("")) {
                requestString = "https://api.tiingo.com/tiingo/daily/" + ticker +
                        "/prices?startDate=" + date + "&token=" + BuildConfig.TIINGO_API_KEY;
            } else {
                requestString = "https://api.tiingo.com/tiingo/daily/" + ticker +
                        "/prices?startDate=" + date + "&endDate=" + newDate + "&token=" + BuildConfig.TIINGO_API_KEY;

            }

            Request request = new Request.Builder()
                    .url(requestString)
                    .get()
                    .build();
            Response response = client.newCall(request).execute();
            String stringArr = Objects.requireNonNull(response.body()).string();
            JSONArray arr = new JSONArray(stringArr);
            int arrHash = arr.hashCode();
            if (arr.length() > 1) {
                for (int i = 0; i < arr.length(); i++) {
                    String dateString = arr.getJSONObject(i).getString("date");
                    String dString = dateString.substring(0, 10);
                    StockDetails deets = new StockDetails(0, 0, " ", 0, 0, 0, 0, 0,
                            0, 0, 0, 0, 0, 0, 0,
                            " ", 0, 0, 0, 0, 0);
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

    // Refactored roundIt function
    public double roundIt(Double d) {
        return BigDecimal.valueOf(d).setScale(2, BigDecimal.ROUND_UP).doubleValue();
    }
}