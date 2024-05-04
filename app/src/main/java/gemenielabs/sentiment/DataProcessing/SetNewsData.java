package gemenielabs.sentiment.DataProcessing;

import static gemenielabs.sentiment.MainActivity.stockDao;

import android.content.Context;
import android.util.Log;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

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

import java.io.IOException;

public class SetNewsData {

    public List<NewsDetails> setNewsData(String ticker, List<StockDetails> list, Context context) {

        // Get news stories for the given ticker
        List<NewsDetails> newsStories = stockDao.getNewsDetails(ticker);

        // Get the most recent date from the news stories
        LocalDate mostRecentDate = newsStories.isEmpty() ? null : LocalDate.parse(newsStories.get(0).getDate());

        // Create a new NewsDetails object to store the details of each news story
        NewsDetails deets = new NewsDetails(" ", " ", " ", " ", " ");

        OkHttpClient client = new OkHttpClient();

        Request request = new Request.Builder()
                .url("https://api.tiingo.com/tiingo/news?tickers=" + ticker + "&token=" + context.getString(R.string.api_key))
                .addHeader("Content-Type", "application/json")
                .build();
            try (Response response = client.newCall(request).execute()) {
                Log.i("NEWS", "REQUESTING");
                if (response.isSuccessful()) {
                    Log.i("NEWS", "SUCCESS");
                    String responseBody = String.valueOf(response.body());
                    //JsonObject jsonObject = JsonParser.parseString(responseBody).getAsJsonObject();
                    Log.i("NEWS", responseBody);
                } else {
                    Log.i("NEWS", "FAIL " + response.code());

                }
            } catch (IOException e) {

                Log.i("NEWS", String.valueOf(e));
            }
        try {
            // Build the URL for the ticker on MarketWatch (Blocking Requests)
            //String url = "https://www.marketwatch.com/investing/stock/" + ticker + "?mod=quote_search";
            // Build the URL for the ticker on Tiingo
            String url = "https://api.tiingo.com/tiingo/news?tickers=" + ticker + "&token=" + context.getString(R.string.api_key);
            Log.i("NEWS", "TEST1");
            // Send a GET request to the URL and parse the response using Jsoup
            Document doc = Jsoup.connect(url).get();
            Log.i("NEWS", String.valueOf(doc));
            // Get all the article content elements from the page
            Elements elements = doc.getElementsByClass("article__content");

            // Get a list of all the dates in the given list of stock details
            List<String> dates = list.stream().map(StockDetails::getDate).collect(Collectors.toList());

            // Loop through each article content element
            for (Element element : elements) {

                // Skip the element if it doesn't have any text
                if (!element.hasText()) {
                    continue;
                }

                // Get the title, address, and article date from the element
                String title = element.getElementsByClass("link").text();
                String address = element.getElementsByClass("link").attr("href");
                String articleDate = element.getElementsByClass("article__timestamp").attr("data-est").substring(0, 10);

                // Parse the article date into a LocalDate object
                LocalDate aD = LocalDate.parse(articleDate);

                // Skip the element if the address doesn't contain "marketwatch.com"
                if (!address.contains("marketwatch.com")) {
                    continue;
                }

                // Skip the element if its article date is on or before the most recent date
                if (mostRecentDate != null && (aD.isEqual(mostRecentDate) || aD.isBefore(mostRecentDate))) {
                    continue;
                }

                // Skip the element if its article date is not in the given list of dates
                if (!dates.contains(articleDate)) {
                    continue;
                }

                // Set the details of the NewsDetails object and insert it into the database
                deets.setAddress(address);
                deets.setTitle(title);
                deets.setDate(articleDate);
                deets.setArticleDate(element.getElementsByClass("article__timestamp").text());
                deets.setNewsTicker(ticker);
                stockDao.insertNewsContent(deets);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Get the updated news stories from the database and return them
        return stockDao.getNewsDetails(ticker);
    }
}


