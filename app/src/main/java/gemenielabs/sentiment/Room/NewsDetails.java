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

    @ColumnInfo(name = "title")
    public String title;

    @ColumnInfo(name = "article_date")
    public String articleDate;

    @ColumnInfo(name = "address")
    public String address;

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
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getArticleDate() {
        return articleDate;
    }

    public void setArticleDate(String articleDate) {
        this.articleDate = articleDate;
    }

    public NewsDetails(String date, String ticker, String title, String articleDate, String address) {
        this.date = date;
        this.ticker = ticker;
        this.title = title;
        this.articleDate = articleDate;
        this.address = address;
    }
}