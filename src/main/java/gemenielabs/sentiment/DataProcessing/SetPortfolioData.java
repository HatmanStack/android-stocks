package gemenielabs.sentiment.DataProcessing;

import static gemenielabs.sentiment.Fragments.SearchFragment.client;
import static gemenielabs.sentiment.MainActivity.blockingActionBar;
import static gemenielabs.sentiment.MainActivity.stockDao;

import android.content.Context;
import android.util.Log;

import com.google.gson.Gson;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import gemenielabs.sentiment.Helper.JsonReturn;
import gemenielabs.sentiment.Helper.JsonRow;
import gemenielabs.sentiment.Room.CombinedWordDetails;
import gemenielabs.sentiment.Room.PortfolioDetails;
import gemenielabs.sentiment.Room.StockDetails;
import gemenielabs.sentiment.Room.WordCountDetails;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class SetPortfolioData {


    public static final MediaType JSON = MediaType.parse("application/json");
    public List<PortfolioDetails> setPortfolioData( boolean updating, String name,
                                                    String ticker, Context context){

        if(updating){
            List<PortfolioDetails> deets = stockDao.getPortfolioDetails();
            Log.i("TAG", "DEETS   SIZE  " + deets.size());
            ArrayList<CompletableFuture> jsonReturns = new ArrayList<>();
            for(int i = 0;i<deets.size();i++) {
                String deetsTicker = deets.get(i).getTicker();
                jsonReturns.add(CompletableFuture.supplyAsync(() -> (getPrediction(deetsTicker, context))));
            }
            while(jsonReturns.size() != deets.size()){}
            for(CompletableFuture future : jsonReturns) {
                String jsonString = "";
                try {
                    jsonString = (String) future.get();
                } catch (ExecutionException e) {
                    e.printStackTrace();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                JsonReturn json = new Gson().fromJson(jsonString, JsonReturn.class);
                PortfolioDetails details = stockDao.getSinglePortfolioDetails(json.getTicker());
                details.setNext(json.getNext());
                details.setWks(json.getWeek());
                details.setMnth(json.getMonth());
                stockDao.insertPortfolioDetails(details);
            }
        }else {
            PortfolioDetails portfolioDetails = new PortfolioDetails("", "", "", "", "");
            portfolioDetails.setTicker(ticker);
            portfolioDetails.setName(name);
            JsonReturn jsonReturn = new Gson().fromJson(getPrediction(ticker, context),JsonReturn.class);
            portfolioDetails.setNext(jsonReturn.getNext());
            portfolioDetails.setWks(jsonReturn.getWeek());
            portfolioDetails.setMnth(jsonReturn.getMonth());
            Log.i("TAG", "INSERT  DETAILS");
            stockDao.insertPortfolioDetails(portfolioDetails);
        }
        blockingActionBar = false;
        return stockDao.getPortfolioDetails();
    }


    public String getPrediction(String ticker, Context context){
            SetStockPriceData setStockPriceData = new SetStockPriceData();
            SetNewsData setNewsData = new SetNewsData();
            SetWordCountData wordCountData = new SetWordCountData();
            SetCombineWordCountData combineWordCountData = new SetCombineWordCountData();
            List<StockDetails> stockDetails = setStockPriceData.getPriceData(ticker, String.valueOf(LocalDate.now()));
            List<WordCountDetails> wordCountDetails = wordCountData.setWordCountData(ticker,
                    setNewsData.setNewsData(ticker, stockDetails), context);
            List<CombinedWordDetails> combinedWordDetails = combineWordCountData.combineDates(wordCountDetails);
            int holder = 0;
            List<StockDetails> priceList = stockDao.getStockDetails(ticker);
            double[] closeArr = new double[priceList.size()];
            double[] volumeArr = new double[priceList.size()];
            double[] positiveArr = new double[priceList.size()];
            double[] negativeArr = new double[priceList.size()];
            double[] sentimentArr = new double[priceList.size()];
            for (int j = 0; j < priceList.size(); j++) {
                int pos = 0;
                int neg = 0;
                int sentiment = 0;
                if (holder < combinedWordDetails.size() &&
                        priceList.get(j).getDate().equals(combinedWordDetails.get(holder).getDate())) {
                    pos = combinedWordDetails.get(holder).getPositive();
                    neg = combinedWordDetails.get(holder).getNegative();
                    if (combinedWordDetails.get(holder).getSentiment().equals("POS")) {
                        sentiment = 1;
                    } else if(combinedWordDetails.get(holder).getSentiment().equals("NEUT")) {
                        sentiment = 2;
                    } else {
                        sentiment = 3;
                    }
                    holder += 1;
                }
                closeArr[j] = priceList.get(j).getClose();
                volumeArr[j] = priceList.get(j).getVolume();
                positiveArr[j] = pos;
                negativeArr[j] = neg;
                sentimentArr[j] = sentiment;
            }
            JsonRow sourceArray = new JsonRow(closeArr, volumeArr, positiveArr, negativeArr, sentimentArr, ticker);
            String jString = new Gson().toJson(sourceArray);
            Log.i("TAG_SetPortfolioData_jString:   ", jString);
            String url = "https://stocks-f3jmjyxrpq-uc.a.run.app";
            String prediction = "";
            try {
                RequestBody body = RequestBody.create(JSON, jString);
                Request request = new Request.Builder()
                        .url(url)
                        .post(body)
                        .build();
                Log.i("TAG_prediction_Request:  ", request.toString());
                Response response = client.newCall(request).execute();
                prediction = Objects.requireNonNull(response.body()).string();
                Log.i("TAG_prediction", "PREDICTION  " + prediction);
            } catch (Exception e) {
                e.printStackTrace();
            }
        return prediction;
    }
}
