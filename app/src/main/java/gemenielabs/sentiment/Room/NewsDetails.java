package gemenielabs.sentiment.Room;


import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

@Entity(tableName = "news_details")
public class NewsDetails {

    @PrimaryKey(autoGenerate = true)
    public int id;

    @ColumnInfo(name = "date")
    public String date;

    @ColumnInfo(name = "ticker")
    public String ticker;

    @ColumnInfo(name = "article_tickers")
    public String articleTickers;

    @ColumnInfo(name = "title")
    public String title;

    @ColumnInfo(name = "article_date")
    public String articleDate;

    @ColumnInfo(name = "article_url")
    public String articleUrl;

    @ColumnInfo(name = "publisher")
    public String publisher;
    @ColumnInfo(name = "amp_url")
    public String ampUrl;

    @ColumnInfo(name = "article_description")
    public String articleDescription;
    public String getArticleDescription(){return articleDescription;}
    public void setArticleDescription(String articleDescription){this.articleDescription = articleDescription;}
    public String getArticleTickers(){return articleTickers;}
    public void setArticleTickers(String articleTickers){this.articleTickers = articleTickers;}
    public String getAmpUrl(){return ampUrl;}
    public void setAmpUrl(String ampUrl){this.ampUrl = ampUrl;}
    public String getPublisher(){return publisher;}
    public void setPublisher(String publisher){this.publisher = publisher;}
    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getNewsTicker() {
        return ticker;
    }

    public void setNewsTicker(String ticker) {
        this.ticker = ticker;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAddress() {
        return articleUrl;
    }

    public void setAddress(String address) {
        this.articleUrl = articleUrl;
    }

    public String getArticleDate() {
        return articleDate;
    }

    public void setArticleDate(String articleDate) {
        this.articleDate = articleDate;
    }

    public NewsDetails(String date, String ticker, String title, String articleDate, String articleUrl, String articleTickers, String ampUrl, String publisher, String articleDescription) {
        this.date = date;
        this.ticker = ticker;
        this.title = title;
        this.articleDate = articleDate;
        this.articleUrl = articleUrl;
        this.articleTickers = articleTickers;
        this.ampUrl = ampUrl;
        this.publisher = publisher;
        this.articleDescription = articleDescription;
    }
}