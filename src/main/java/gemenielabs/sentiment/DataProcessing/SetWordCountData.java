package gemenielabs.sentiment.DataProcessing;

import static java.lang.Boolean.FALSE;
import static java.lang.Boolean.TRUE;
import static gemenielabs.sentiment.Fragments.SearchFragment.client;
import static gemenielabs.sentiment.MainActivity.stockDao;

import android.content.Context;
import android.util.Log;

import com.google.gson.Gson;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;

import java.net.SocketTimeoutException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import gemenielabs.sentiment.Helper.JsonReturn;
import gemenielabs.sentiment.Helper.JsonSend;
import gemenielabs.sentiment.R;
import gemenielabs.sentiment.Room.NewsDetails;
import gemenielabs.sentiment.Room.WordCountDetails;
import okhttp3.MediaType;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class SetWordCountData {

    public static final MediaType JSON = MediaType.parse("application/json");
    private static final String FAIL = "fail";

    public List<WordCountDetails> setWordCountData(String ticker, List<NewsDetails> list,
                                                   Context context) {
        Log.i("TAG_start  ", "SETWordCountData_START");
        Log.i("TAG_SetWordCount_list_size: ", String.valueOf(list.size()));
        ArrayList<CompletableFuture> articles = new ArrayList<>();
        if(list.size() > 0){
            Log.i("TAG_SetWordCount_start_NewSentiment:   ", "Start");

            ArrayList<CompletableFuture> results = new ArrayList<>();

            for (int i = 0; i < list.size(); i++) {
                String newsArticleDate = list.get(i).getDate();
                String url = list.get(i).getAddress();
                Log.i("TAG_setWordCount_newsArticleDate:  ", newsArticleDate );
                articles.add(CompletableFuture.supplyAsync(() -> getArticleBody(url,newsArticleDate)));
            }

            while(articles.size() != list.size()){}
            HashMap<String, String[]> Hash_Article_Date = new HashMap<>();
            int SpeedDisMuthaUp = 0;
            for(CompletableFuture future : articles){
                String[] body = new String[0];
                try {
                    body = (String[]) future.get();
                } catch (ExecutionException e) {
                    e.printStackTrace();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                String replaceNumbers = body[0].replaceAll("-*\\+*\\d*.\\d*%", "");
                Log.i("TAG_setWordCount_replaceNumbers_string:  ", replaceNumbers );
                int hash = replaceNumbers.hashCode();
                WordCountDetails isHere = stockDao.getSingleHashedWordCountDetails(ticker, hash);
                if(isHere != null){
                    String failed = isHere.getSentiment();
                    Log.i("TAG_setWordCount_failed_string:  ", failed );
                    if (!failed.equals(FAIL)){
                        continue;
                    }
                }
                if(!body[0].equals(FAIL) && SpeedDisMuthaUp < 8) {
                    Hash_Article_Date.put(String.valueOf(hash), body);
                    SpeedDisMuthaUp++;
                }
            }

            for(String key :  Hash_Article_Date.keySet()){
                String[] bodyWithHash = {key, Hash_Article_Date.get(key)[0]};
                results.add(CompletableFuture.supplyAsync(() -> getSentiment(bodyWithHash)));
            }
            Log.i("TAG_setWordCount_check_articleList_Size_Against_ResultSize_first:  ", Hash_Article_Date.size() +"  "+ results.size());
            while(Hash_Article_Date.size() != results.size()){}

            for(CompletableFuture future : results){
                String returns = null;
                try {
                    returns = (String) future.get();
                } catch (ExecutionException e) {
                    e.printStackTrace();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                WordCountDetails wordCountDetails = new WordCountDetails(" ",0, " ",
                        0, 0, 0, 0, 0, "",
                        "", 0);
                String[] resultsString = returns.split(" ");

                String body = Hash_Article_Date.get(resultsString[0])[0];
                String date = Hash_Article_Date.get(resultsString[0])[1];;
                if(resultsString[1].equals(FAIL)){
                    wordCountDetails.setSentiment(FAIL);
                    wordCountDetails.setDate(date);
                    wordCountDetails.setBody(body);
                    wordCountDetails.setHash(Integer.valueOf(resultsString[0]));
                    stockDao.insertWordCountContent(wordCountDetails);
                    continue;
                }

                int[] words = recordWordCounts(context, body);
                wordCountDetails.setSentiment(resultsString[1]);
                wordCountDetails.setSentimentNumber(Double.parseDouble(resultsString[2]));
                wordCountDetails.setDate(date.substring(0, 10));
                wordCountDetails.setTicker(ticker);
                wordCountDetails.setHash(Integer.valueOf(resultsString[0]));
                double next = createPercentageGainLoss(ticker, date, 0);
                double wks = createPercentageGainLoss(ticker, date, 14);
                double mnth = createPercentageGainLoss(ticker, date, 28);
                wordCountDetails.setNextDay(next);
                wordCountDetails.setTwoWks(wks);
                wordCountDetails.setOneMnth(mnth);
                wordCountDetails.setBody(body);
                wordCountDetails.setPositive(words[0]);
                wordCountDetails.setNegative(words[1]);
                Log.i("TAG_setWordCount_wordCountDetails_Sentiment:  " , resultsString[1]);
                Log.i("TAG_setWordCount_wordCountDetails_SentimentNumber:  " , resultsString[2]);
                Log.i("TAG_setWordCount_wordCountDetails_Date:  " , date.substring(0, 10));
                Log.i("TAG_setWordCount_wordCountDetails_Ticker:  " , ticker);
                Log.i("TAG_setWordCount_wordCountDetails_Positive:  " , String.valueOf(words[0]));
                Log.i("TAG_setWordCount_wordCountDetails_Negative:  " , String.valueOf(words[1]));
                Log.i("TAG_setWordCount_wordCountDetails_Hash:  " , resultsString[0]);
                Log.i("TAG_setWordCount_wordCountDetails_NextDay:  " , String.valueOf(next));
                Log.i("TAG_setWordCount_wordCountDetails_TwoWks:  " , String.valueOf(wks));
                Log.i("TAG_setWordCount_wordCountDetails_OneMnth:  " , String.valueOf(mnth));
                stockDao.insertWordCountContent(wordCountDetails);
                }
        }
        List<WordCountDetails> wordCountDetailsList = stockDao.getWordCountDetails(ticker);
        if(wordCountDetailsList.size() == 0){
            createNoNewsWordCountDetail(ticker);
            wordCountDetailsList = stockDao.getWordCountDetails(ticker);
        }
        return wordCountDetailsList;
    }

    private void createNoNewsWordCountDetail(String ticker) {
        WordCountDetails wordCountDetails = new WordCountDetails(" ", 0," ",
                0, 0, 0, 0, 0, "",
                "", 0);
        String noNewsData = "No News Data";
        wordCountDetails.setTicker(ticker);
        wordCountDetails.setSentiment(noNewsData);
        wordCountDetails.setHash(noNewsData.hashCode());
        LocalDate date = LocalDate.now();
        wordCountDetails.setDate(date.toString());
        stockDao.insertWordCountContent(wordCountDetails);
    }

    public String[] getArticleBody(String url, String date){
        String[] body = {"", date};
        try {
            Request request = new Request.Builder()
                    .url(url)
                    .get()
                    .build();
            Response response = client.newCall(request).execute();
            Document doc = Jsoup.parse(Objects.requireNonNull(response.body()).string());
            body[0] = Objects.requireNonNull(doc.getElementById("js-article__body")).text();
        } catch (Exception e) {
            e.printStackTrace();
            Log.i("TAG_setWordCount_getArticleBody_Successful:  ", "FALSE");
            body[0] = FAIL;
            return body;
        }
        return body;
    }

    public int[] recordWordCounts( Context context, String body){
        String alphabet = "abcdefghijklmnopqrstuvwxyz";
        String[] positive = context.getResources().getStringArray(R.array.positive_words_a);
        String[] negative = context.getResources().getStringArray(R.array.positive_words_a);
        int pos = 0;
        int neg = 0;
        String[] articleBody = body.split(" ");
        Arrays.sort(articleBody);
        String holder = "a";
        for(String word : articleBody){
            String lowerWord = word.toLowerCase().replaceAll("[^a-zA-Z]", "");
            if(lowerWord.length() > 1) {
                String firstLetter = lowerWord.substring(0,1);
                if(!firstLetter.equals(holder)){
                    holder = firstLetter;
                    positive = context.getResources().getStringArray(positive_word_ids[alphabet.indexOf(holder)]);
                    negative = context.getResources().getStringArray(negative_word_ids[alphabet.indexOf(holder)]);
                }
                for (String po : positive) {
                    if (po.equals(lowerWord)) {
                        pos++;
                    }
                }
                for (String n : negative) {
                    if (n.equals(lowerWord)) {
                        neg++;
                    }
                }
            }
        }
        return new int[]{pos,neg};
    }

    public double createPercentageGainLoss(String ticker, String date, int time) {
        LocalDate dateGain = LocalDate.parse(date);
        dateGain = dateGain.plusDays(time);
        boolean naPrevent = FALSE;
        for (int j = 0; j < 5; j++) {
            dateGain = dateGain.plusDays(1);
            if (stockDao.getSingleStock(ticker, dateGain.toString()) != null) {
                naPrevent = TRUE;
                break;
            }else if(j == 4){
                return 0;
            }
        }
        double change = stockDao.getSingleStock(ticker, dateGain.toString()).getClose() -
            stockDao.getSingleStock(ticker, date).getClose();
        double finalChange =  change / stockDao.getSingleStock(ticker, dateGain.toString()).getClose();
        //To prevent N/A for 0.0 final change on close @ the same price two days in a row
        if(naPrevent && (finalChange == 0.0)){
            finalChange = 0.00001;
        }
        return finalChange;
    }


    public String getSentiment(String[] body){
        String alpha = body[1].replaceAll("\"", "").replaceAll("'","")
                .replaceAll(",", "").replaceAll("’","");
        String[] alphaSplit = alpha.split("(?<!\\w\\.\\w.)(?<!([A-Z][a-z])\\{30,\\}\\.)(?<=[.?])\\s");
        String hashString = body[0];
        JsonSend sourceArray = new JsonSend(alphaSplit, hashString);
        String jString = new Gson().toJson(sourceArray);
        Log.i("TAG_SetWordCountData_jString:  ", jString);
        String url = "https://stocks-backend-sentiment-f3jmjyxrpq-uc.a.run.app";
        String prediction = "";
        try {
            RequestBody r_body = RequestBody.create(JSON, jString);
            Request request = new Request.Builder()
                    .url(url)
                    .post(r_body)
                    .build();
            Log.i("TAG_setWordCount_Request:  ", request.toString());
            Response response = client.newCall(request).execute();
            String bodyOfResponse = response.body().string();
            prediction = convertToList(new Gson().fromJson(bodyOfResponse, JsonReturn.class));
            response.close();
        } catch(SocketTimeoutException e){
            return hashString +" "+ FAIL+" " + body[1];
        } catch (Exception e) {
            e.printStackTrace();
            Log.i("TAG_setWordCount_getSentiment_catch_block  ", "FAIL");
            return hashString +" "+ FAIL+" " + body[1];
        }
        return prediction;
    }

    public String convertToList(JsonReturn prediction) {
        String[] positive = prediction.getPositive();
        String[] neutral = prediction.getNeutral();
        String[] negative = prediction.getNegative();
        String returnString;
            if (Integer.parseInt(positive[0]) > Integer.parseInt(neutral[0]) && Integer.parseInt(positive[0]) > Integer.parseInt(negative[0])){
                returnString = String.format("Positive %s", positive[1]);
            }else if (Integer.parseInt(neutral[0]) > Integer.parseInt(negative[0])){
                returnString = String.format("Neutral %s", neutral[1]);
            } else {
                returnString = String.format("Negative %s", negative[1]);
            }
        Log.i("TAG_setWordCountData_prediction:   " , returnString);
        return   prediction.getHash() +  " " + returnString;
    }

    int[] positive_word_ids = {
            R.array.positive_words_a,
            R.array.positive_words_b,
            R.array.positive_words_c,
            R.array.positive_words_d,
            R.array.positive_words_e,
            R.array.positive_words_f,
            R.array.positive_words_g,
            R.array.positive_words_h,
            R.array.positive_words_i,
            R.array.positive_words_j,
            R.array.positive_words_k,
            R.array.positive_words_l,
            R.array.positive_words_m,
            R.array.positive_words_n,
            R.array.positive_words_o,
            R.array.positive_words_p,
            R.array.positive_words_q,
            R.array.positive_words_r,
            R.array.positive_words_s,
            R.array.positive_words_t,
            R.array.positive_words_u,
            R.array.positive_words_v,
            R.array.positive_words_w,
            R.array.positive_words_x,
            R.array.positive_words_y,
            R.array.positive_words_z};

    int[] negative_word_ids = {
            R.array.negative_words_a,
            R.array.negative_words_b,
            R.array.negative_words_c,
            R.array.negative_words_d,
            R.array.negative_words_e,
            R.array.negative_words_f,
            R.array.negative_words_g,
            R.array.negative_words_h,
            R.array.negative_words_i,
            R.array.negative_words_j,
            R.array.negative_words_k,
            R.array.negative_words_l,
            R.array.negative_words_m,
            R.array.negative_words_n,
            R.array.negative_words_o,
            R.array.negative_words_p,
            R.array.negative_words_q,
            R.array.negative_words_r,
            R.array.negative_words_s,
            R.array.negative_words_t,
            R.array.negative_words_u,
            R.array.negative_words_v,
            R.array.negative_words_w,
            R.array.negative_words_x,
            R.array.negative_words_y,
            R.array.negative_words_z};

}
