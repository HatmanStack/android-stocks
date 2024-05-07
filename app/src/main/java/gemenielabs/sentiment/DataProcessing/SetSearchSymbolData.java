package gemenielabs.sentiment.DataProcessing;

import static gemenielabs.sentiment.Fragments.SearchFragment.client;


import android.content.Context;

import gemenielabs.sentiment.BuildConfig;
import gemenielabs.sentiment.R;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import org.json.JSONArray;

import java.util.ArrayList;

public class SetSearchSymbolData {

    // Create a new OkHttpClient instance
    private final OkHttpClient client = new OkHttpClient();

    // Refactored method to get search data
    public ArrayList<String[]> getSearchData(String terms, Context context) {
        // Build the URL string with the provided search terms and API key
        String url = "https://api.tiingo.com/tiingo/utilities/search?query=" + terms +
                "&token=" + BuildConfig.TIINGO_API_KEY;

        // Create a new Request object with the URL
        Request request = new Request.Builder()
                .url(url)
                .get()
                .build();

        // Create a new ArrayList to store the search results
        ArrayList<String[]> searchResults = new ArrayList<>();

        try {
            // Execute the request and get the response
            Response response = client.newCall(request).execute();

            // Get the response body as a string
            String responseBody = response.body().string();

            // Parse the response body as a JSONArray
            JSONArray jsonArray = new JSONArray(responseBody);

            // Loop through the JSONArray and extract the ticker and name for each search result
            for (int i = 0; i < jsonArray.length(); i++) {
                String ticker = jsonArray.getJSONObject(i).getString("ticker");
                String name = jsonArray.getJSONObject(i).getString("name");

                // Create a new String array to store the name and ticker
                String[] data = {name, ticker};

                // Add the String array to the searchResults ArrayList
                searchResults.add(data);
            }
        } catch (Exception e) {
            // Print the stack trace if an exception occurs
            e.printStackTrace();
        }

        // Return the searchResults ArrayList
        return searchResults;
    }
}
