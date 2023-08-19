package gemenielabs.sentiment.DataProcessing;

import static gemenielabs.sentiment.Fragments.SearchFragment.client;
import static gemenielabs.sentiment.MainActivity.stockDao;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import gemenielabs.sentiment.Room.NewsDetails;
import gemenielabs.sentiment.Room.StockDetails;
import okhttp3.Request;
import okhttp3.Response;

public class SetNewsData {

    public List<NewsDetails> setNewsData(String ticker, List<StockDetails> list) {

        // Get news stories for the given ticker
        List<NewsDetails> newsStories = stockDao.getNewsDetails(ticker);

        // Get the most recent date from the news stories
        LocalDate mostRecentDate = newsStories.isEmpty() ? null : LocalDate.parse(newsStories.get(0).getDate());

        // Create a new NewsDetails object to store the details of each news story
        NewsDetails deets = new NewsDetails(" ", " ", " ", " ", " ");

        try {
            // Build the URL for the ticker on MarketWatch
            String url = "https://www.marketwatch.com/investing/stock/" + ticker + "?mod=quote_search";

            // Send a GET request to the URL and parse the response using Jsoup
            Document doc = Jsoup.connect(url).get();

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


