package gemenielabs.sentiment.DataProcessing;

import static gemenielabs.sentiment.MainActivity.stockDao;

import android.content.Context;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Room.NewsDetails;
import gemenielabs.sentiment.Room.StockDetails;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import gemenielabs.sentiment.BuildConfig;

import java.io.IOException;
import java.util.zip.GZIPInputStream;

public class SetNewsData {

    public List<NewsDetails> setNewsData(String ticker, List<StockDetails> list, String date, Context context) {
        Log.i("NEWS", "Start");
        // Get news stories for the given ticker
        List<NewsDetails> newsStories = stockDao.getNewsDetails(ticker);

        OkHttpClient client = new OkHttpClient();

        Request request = new Request.Builder()
                .url("https://api.polygon.io/v2/reference/news?ticker=" + ticker + "&published_utc=" + 
                date +  "&apiKey=" + BuildConfig.POLYGON_API_KEY)
                .addHeader("Content-Type", "application/json")
                .build();
            try (Response response = client.newCall(request).execute()) {

                if (response.isSuccessful()) {
                    Log.i("NEWS", "SUCCESS");
                    JSONObject jsonObject = new JSONObject(response.body().string());
                    JSONArray results = jsonObject.getJSONArray("results");
                    Log.i("NEWS", results.toString());
                    for (int i = 0; i < results.length(); i++) {
                        
                        JSONObject result = results.getJSONObject(i);
                        String articleUrl = result.optString("article_url");

                        boolean urlExists = false;
                        for (NewsDetails newsDetail : newsStories) {
                            if (newsDetail.getAddress().equals(articleUrl)) {
                                urlExists = true;
                                break;
                            }
                        }
                        if (urlExists) {
                            continue;
                        }

                        String title = result.optString("title");
                        String articleDate = result.optString("published_utc").split("T")[0];
                        String publisher = result.optString("name");
                        String articleTickers = result.optString("tickers");
                        String ampUrl = result.optString("amp_url");
                        String articleDescription = result.optString("description");
                        // Create a new NewsDetails object to store the details of each news story

                        NewsDetails deets = new NewsDetails(date, ticker, title, articleDate, articleUrl, articleTickers, ampUrl, publisher, articleDescription);
                        Log.i("NEWS", deets.toString());
                        stockDao.insertNewsContent(deets);
                    }
                } else {
                    Log.i("NEWS", "FAIL " + response.code());
                }
            } catch (IOException | JSONException e) {

                Log.i("NEWS", String.valueOf(e));
            }
        // Get the updated news stories from the database and return them
        return stockDao.getNewsDetails(ticker);
    }
}


