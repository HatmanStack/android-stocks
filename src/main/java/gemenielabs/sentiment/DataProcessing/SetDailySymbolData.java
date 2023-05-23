package gemenielabs.sentiment.DataProcessing;


import static gemenielabs.sentiment.MainActivity.stockDao;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.Objects;

import gemenielabs.sentiment.Room.SymbolDetails;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class SetDailySymbolData {

    public SymbolDetails setDailySymbolData(String terms){
        SymbolDetails deets = stockDao.getDailySymbol(terms);
        if(deets == null) {
            deets = new SymbolDetails();
            OkHttpClient client = new OkHttpClient();
            String string = "https://api.tiingo.com/tiingo/daily/" + terms +
                    "?token=<INSERT API KEY HERE>";
            Request request = new Request.Builder()
                    .url(string)
                    .get()
                    .build();
            try {
                Response response = client.newCall(request).execute();
                JSONObject jsonObject = new JSONObject(Objects.requireNonNull(response.body()).string());
                deets.setTicker(jsonObject.getString("ticker"));
                deets.setEndDate(jsonObject.getString("endDate"));
                deets.setStartDate(jsonObject.getString("startDate"));
                deets.setExchangeCode(jsonObject.getString("exchangeCode"));
                deets.setLongDescription(jsonObject.getString("description"));
                deets.setName(jsonObject.getString("name"));
                stockDao.insertSymbol(deets);
                }
            catch (IOException | JSONException e) {
                e.printStackTrace();
            }
        }
        return deets;
    }
}
