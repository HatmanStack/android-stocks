package gemenielabs.sentiment.DataProcessing;

import static gemenielabs.sentiment.Fragments.SearchFragment.client;

import org.json.JSONArray;

import java.util.ArrayList;
import java.util.Objects;

import okhttp3.Request;
import okhttp3.Response;


public class SetSearchSymbolData {

    public ArrayList<String[]> getSearchData(String terms){

        String string = "https://api.tiingo.com/tiingo/utilities/search?query=" + terms +
                "&token=<INSERT API KEY HERE>";
        Request request = new Request.Builder()
                .url(string)
                .get()
                .build();
        ArrayList<String[]> returnString = new ArrayList<>();
        try {
            Response response = client.newCall(request).execute();
            String responseString = Objects.requireNonNull(response.body()).string();
            JSONArray arr = new JSONArray(responseString);
            for(int i =0;i<arr.length();i++) {
                String ticker = arr.getJSONObject(i).getString("ticker");
                String name = arr.getJSONObject(i).getString("name");
                String[] data = new String[2];
                data[0] = name;
                data[1] = ticker;
                returnString.add(data);
            }
        } catch (Exception e){
            e.printStackTrace();
        }
        return returnString;
    }
}
