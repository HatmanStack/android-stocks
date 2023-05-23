package gemenielabs.sentiment.Helper;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;

import java.util.List;

import gemenielabs.sentiment.Room.CombinedWordDetails;
import gemenielabs.sentiment.Room.NewsDetails;
import gemenielabs.sentiment.Room.PortfolioDetails;
import gemenielabs.sentiment.Room.StockDetails;
import gemenielabs.sentiment.Room.WordCountDetails;

public class PriceLiveData extends ViewModel {

    private MutableLiveData<String> ticker;
    private MutableLiveData<String> description;
    private MutableLiveData<String> name;
    private MutableLiveData<String> date;
    private MutableLiveData<List<StockDetails>> Price;
    private MutableLiveData<List<NewsDetails>> news;
    private MutableLiveData<List<WordCountDetails>> wordCountDetails;
    private MutableLiveData<List<CombinedWordDetails>> combineWordDetails;
    private MutableLiveData<List<PortfolioDetails>> portfolioDetails;

    public MutableLiveData<List<StockDetails>> getPrice(){
        if(Price == null){
            Price = new MutableLiveData<>();
        }
        return Price;
    }

    public MutableLiveData<String> getTicker(){
        if(ticker == null){
            ticker = new MutableLiveData<>();
        }
        return ticker;
    }

    public MutableLiveData<String> getDescription(){
        if(description == null){
            description = new MutableLiveData<>();
        }
        return description;
    }

    public MutableLiveData<List<CombinedWordDetails>> getCombinedWordDetails(){
        if(combineWordDetails == null){
            combineWordDetails = new MutableLiveData<>();
        }
        return combineWordDetails;
    }

    public MutableLiveData<List<NewsDetails>> getNewsContent(){
        if(news == null){
            news = new MutableLiveData<>();
        }
        return news;
    }

    public MutableLiveData<List<WordCountDetails>> getWordCountContent(){
        if(wordCountDetails == null){
            wordCountDetails = new MutableLiveData<>();
        }
        return wordCountDetails;
    }

    public MutableLiveData<List<PortfolioDetails>> getPortfolioDetails(){
        if(portfolioDetails == null){
            portfolioDetails = new MutableLiveData<>();
        }
        return portfolioDetails;
    }

    public MutableLiveData<String> getName(){
        if(name == null){
            name = new MutableLiveData<>();
        }
        return name;
    }
    
    public MutableLiveData<String> getDate(){
        if(date == null){
            date = new MutableLiveData<>();
        }
        return date;
    }

}