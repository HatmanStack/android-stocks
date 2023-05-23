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

import gemenielabs.sentiment.Room.NewsDetails;
import gemenielabs.sentiment.Room.StockDetails;
import okhttp3.Request;
import okhttp3.Response;

public class SetNewsData {

    public List<NewsDetails> setNewsData(String ticker, List<StockDetails> list) {

        List<NewsDetails> newsStories = stockDao.getNewsDetails(ticker);
        String mostRecentDate = "";
        LocalDate mD = null;
        if (!newsStories.isEmpty()) {
            mostRecentDate = newsStories.get(0).getDate();
            mD = LocalDate.parse(mostRecentDate);
        }
        NewsDetails deets = new NewsDetails(" ", " ", " ", " ", " ");
        try {
            String string = "https://www.marketwatch.com/investing/stock/" + ticker + "?mod=quote_search";
            Request request = new Request.Builder()
                    .url(string)
                    .get()
                    .build();
            Response response = client.newCall(request).execute();
            Document doc = Jsoup.parse(Objects.requireNonNull(response.body()).string());
            Elements elements = doc.getElementsByClass("article__content");
            List<String> dates = new ArrayList<>();
            for(StockDetails date: list){
                dates.add(date.getDate());
            }
            for (int i = 0; i < elements.size(); i++) {
                Element element = elements.get(i);
                if(!element.hasText()){
                    continue;
                }
                String title = element.getElementsByClass("link").text();
                String address = element.getElementsByClass("link").attr("href");
                String articleD = element.getElementsByClass("article__timestamp").text();
                String articleDate = element.getElementsByClass("article__timestamp").attr("data-est").substring(0,10);
                LocalDate aD = LocalDate.parse(articleDate);
                if(!address.contains("marketwatch.com")){
                    continue;
                }
                if(mostRecentDate.length() != 0){
                    if(aD.isEqual(mD) || aD.isBefore(mD)) {
                        continue;
                    }
                }

                if(dates.contains(articleDate)) {
                    deets.setAddress(address);
                    deets.setTitle(title);
                    deets.setDate(articleDate);
                    deets.setArticleDate(articleD);
                    deets.setNewsTicker(ticker);
                    stockDao.insertNewsContent(deets);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        newsStories = stockDao.getNewsDetails(ticker);
        return newsStories;
    }
}


