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

    public SymbolDetails setDailySymbolData(String terms) {
        // Get the SymbolDetails object from the stockDao
        SymbolDetails deets = stockDao.getDailySymbol(terms);

        // If the SymbolDetails object is null, create a new one and populate it with data from the Tiingo API
        if (deets == null) {
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

                // Set the properties of the SymbolDetails object using data from the Tiingo API
                deets.setTicker(jsonObject.getString("ticker"));
                deets.setEndDate(jsonObject.getString("endDate"));
                deets.setStartDate(jsonObject.getString("startDate"));
                deets.setExchangeCode(jsonObject.getString("exchangeCode"));
                deets.setLongDescription(jsonObject.getString("description"));
                deets.setName(jsonObject.getString("name"));

                // Insert the SymbolDetails object into the stockDao
                stockDao.insertSymbol(deets);
            } catch (IOException | JSONException e) {
                e.printStackTrace();
            }
        }

        // Return the SymbolDetails object
        return deets;
    }
}
