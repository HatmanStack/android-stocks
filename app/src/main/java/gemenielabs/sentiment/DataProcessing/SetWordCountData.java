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

import java.io.IOException;
import java.net.SocketTimeoutException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;

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

    public List<WordCountDetails> setWordCountData(String ticker, List<NewsDetails> list, Context context) {
        // Log statements removed for code conciseness
    
        ArrayList<CompletableFuture> articles = new ArrayList<>();


        if (list.size() > 0) {
            ArrayList<CompletableFuture> results = new ArrayList<>();
            
            // Process each news article asynchronously
            for (NewsDetails news : list) {
                String newsArticleDate = news.getArticleDate();
                String url = news.getAddress();
                
                Log.i("TAG", "ADDRESSES: " + url);

                // Fix until newParsing of article Data is ready
                String articleDescription = news.getArticleDescription();
                articles.add(CompletableFuture.supplyAsync(() -> getArticleBody(url, newsArticleDate, articleDescription)));
            }
    
            // Wait until all articles are processed
            while (articles.size() != list.size()) {
                // Wait until all articles are processed
            }
    
            HashMap<String, String[]> Hash_Article_Date = new HashMap<>();

    
            // Process the articles and gather information
            for (CompletableFuture future : articles) {
                String[] body = new String[0];
                try {
                    body = (String[]) future.get();
                } catch (ExecutionException | InterruptedException e) {
                    e.printStackTrace();
                }
    
                // Remove numbers and percentages from the article body
                String replaceNumbers = body[0].replaceAll("-*\\+*\\d*.\\d*%", "");

                int hash = replaceNumbers.hashCode();
    
                // Check if the article body has been processed before and skip if sentiment is available
                WordCountDetails isHere = stockDao.getSingleHashedWordCountDetails(ticker, hash);
                if (isHere != null ) {
                    continue;
                }
    
                // Add the article body to the HashMap if sentiment is not available and speed limit is not reached
                if (!body[0].equals(FAIL)) {
                    Hash_Article_Date.put(String.valueOf(hash), body);
                }
            }
    
            // Process the article bodies to get sentiment asynchronously
            for (String key : Hash_Article_Date.keySet()) {
                String[] bodyWithHash = {key, Hash_Article_Date.get(key)[0]};

                results.add(CompletableFuture.supplyAsync(() -> getSentiment(bodyWithHash, context)));
            }
    
            // Wait until all results are processed
            while (Hash_Article_Date.size() != results.size()) {
                // Wait until all results are processed
            }
    
            // Insert word count details into the database
            for (CompletableFuture future : results) {
                String returns = null;
                try {
                    returns = (String) future.get();
                } catch (ExecutionException | InterruptedException e) {
                    e.printStackTrace();
                }

                for (Map.Entry<String, String[]> entry : Hash_Article_Date.entrySet()) {
                    System.out.println(entry.getKey() + "=" + Arrays.toString(entry.getValue()));
                }
                WordCountDetails wordCountDetails = createWordCountDetails(ticker, returns, Hash_Article_Date, context);
                Log.i("TAG", "SetWordCountData WordCountDetails" + wordCountDetails);
                stockDao.insertWordCountContent(wordCountDetails);
            }
        }
    
        // Retrieve word count details from the database
        List<WordCountDetails> wordCountDetailsList = stockDao.getWordCountDetails(ticker);
    
        // If no word count details are found, create a default entry
        if (wordCountDetailsList.size() == 0) {
            createNoNewsWordCountDetail(ticker);
            wordCountDetailsList = stockDao.getWordCountDetails(ticker);
        }
        Log.i("TAG", "SetWordCountData " + wordCountDetailsList);
        return wordCountDetailsList;
    }
    
    // Create WordCountDetails object based on the sentiment analysis results
    private WordCountDetails createWordCountDetails(String ticker, String returns, HashMap<String, String[]> hashArticleDate, Context context) {
        WordCountDetails wordCountDetails = new WordCountDetails(" ", 0, " ",
                0, 0, 0, 0, 0, "",
                "", 0);

        String[] resultsString = returns.split(" ");

        String body = hashArticleDate.get(resultsString[0])[0];
        String date = hashArticleDate.get(resultsString[0])[1];
    
        // Set WordCountDetails properties based on sentiment analysis results
        if (resultsString[1].equals(FAIL)) {
            wordCountDetails.setSentiment(FAIL);
            wordCountDetails.setDate(date);
            wordCountDetails.setBody(body);
            wordCountDetails.setHash(Integer.valueOf(resultsString[0]));
            stockDao.insertWordCountContent(wordCountDetails);
            return wordCountDetails;
        }
    
        int[] words = recordWordCounts(context, body);
        wordCountDetails.setSentiment(resultsString[1]);
        wordCountDetails.setSentimentNumber(Double.parseDouble(resultsString[2]));
        wordCountDetails.setDate(date.substring(0, 10));
        wordCountDetails.setTicker(ticker);
        wordCountDetails.setNegative(words[1]);
        wordCountDetails.setPositive(words[0]);
        wordCountDetails.setHash(Integer.valueOf(resultsString[0]));
        double next = createPercentageGainLoss(ticker, date, 0);
        double wks = createPercentageGainLoss(ticker, date, 14);
        double mnth = createPercentageGainLoss(ticker, date, 28);
        wordCountDetails.setNextDay(next);
        wordCountDetails.setTwoWks(wks);
        wordCountDetails.setOneMnth(mnth);
        wordCountDetails.setBody(body);
        return wordCountDetails;
    }
    
    // Create a default WordCountDetails entry for cases with no news data
    private void createNoNewsWordCountDetail(String ticker) {
        WordCountDetails wordCountDetails = new WordCountDetails(" ", 0, " ",
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
    
    // Retrieve the article body from the specified URL
    public String[] getArticleBody(String url, String date, String articleDescription) {
        /**
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
            body[0] = FAIL;
            return body;
        }**/
        return new String[]{articleDescription, date};
    }
    
    // Record word counts for positive and negative words in the article body
    public int[] recordWordCounts(Context context, String body) {
        String alphabet = "abcdefghijklmnopqrstuvwxyz";
        String[] positive = new String[0];
        String[] negative = new String[0];;
        int pos = 0;
        int neg = 0;
        String[] articleBody = body.split(" ");
        Arrays.sort(articleBody);
        String holder = "a";
        for (String word : articleBody) {
            String lowerWord = word.toLowerCase().replaceAll("[^a-zA-Z]", "");
            if (lowerWord.length() > 1) {
                String firstLetter = lowerWord.substring(0, 1);
                if (!firstLetter.equals(holder)) {
                    holder = firstLetter;
                    positive = context.getResources().getStringArray(positive_word_ids[alphabet.indexOf(holder)]);
                    negative = context.getResources().getStringArray(negative_word_ids[alphabet.indexOf(holder)]);
                }
                if (Arrays.asList(positive).contains(lowerWord)) {
                    pos++;
                }
                if (Arrays.asList(negative).contains(lowerWord)) {
                    neg++;
                }
            }
        }

        return new int[]{pos, neg};
    }
    
    // Calculate the percentage gain/loss for the specified ticker and date
    public double createPercentageGainLoss(String ticker, String date, int time) {
        LocalDate comparedDate = LocalDate.parse(date);
        LocalDate futureDate = comparedDate.plusDays(time);
        double finalChange = 0.0;
        String maxDate = String.valueOf(stockDao.getSingleStockTicker(ticker).getDate()).replace("-", "");
        if(maxDate.compareTo(futureDate.toString()) < 0) {
            Double currentPrice = null;
            LocalDate findDate = LocalDate.parse(futureDate.toString());
            for (int j = 0; j < 7; j++) {
                findDate = findDate.plusDays(j);
                if (stockDao.getSingleStock(ticker, findDate.toString()) != null) {
                    currentPrice = stockDao.getSingleStock(ticker, findDate.toString()).getClose();
                    break;
                }
                if(j == 6){
                    return finalChange;
                }
            }

            double change = stockDao.getSingleStock(ticker, comparedDate.toString()).getClose() - currentPrice;
            finalChange = change / stockDao.getSingleStock(ticker, comparedDate.toString()).getClose();

            // Update WordCountDetails with nextDay value
            List<WordCountDetails> wordCountDetails = stockDao.getWordCountDetailsDate(ticker, date);
            for (WordCountDetails wordCountDetails1 : wordCountDetails) {
                wordCountDetails1.setNextDay(finalChange);
                stockDao.insertWordCountContent(wordCountDetails1);
            }
        }

        return finalChange;
    }
    
    // Get sentiment analysis for the given article body
    public String getSentiment(String[] body, Context context) {
        String alpha = body[1].replaceAll("\"", "").replaceAll("'", "").replaceAll(",", "").replaceAll("’", "");
        String[] alphaSplit = alpha.split("(?<!\\w\\.\\w.)(?<!([A-Z][a-z])\\{30,\\}\\.)(?<=[.?])\\s");
        String hashString = body[0];
        JsonSend sourceArray = new JsonSend(alphaSplit, hashString);
        String jString = new Gson().toJson(sourceArray);
        /*
        Log.i("jString", alphaSplit[0]);

        BertNLClassifier.BertNLClassifierOptions options =
                BertNLClassifier.BertNLClassifierOptions.builder()
                        .setBaseOptions(BaseOptions.builder().setNumThreads(4).build())
                        .build();
        BertNLClassifier classifier =
                null;
        try {
            classifier = BertNLClassifier.createFromFileAndOptions(context, "model.tflite", options);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }


        List<Category> results = classifier.classify(alphaSplit[0]);
        Log.i("Results", String.valueOf(results.get(0)));
        */
        String url = "https://stocks-backend-sentiment-f3jmjyxrpq-uc.a.run.app";
        String prediction = "";
        try {
            RequestBody r_body = RequestBody.create(JSON, jString);
            Request request = new Request.Builder()
                    .url(url)
                    .post(r_body)
                    .build();
            Response response = client.newCall(request).execute();
            String bodyOfResponse = response.body().string();
            prediction = convertToList(new Gson().fromJson(bodyOfResponse, JsonReturn.class));
            response.close();
        } catch (SocketTimeoutException e) {
            return hashString + " " + FAIL + " " + body[1];
        } catch (Exception e) {
            e.printStackTrace();
            return hashString + " " + FAIL + " " + body[1];
        }

        return prediction;


    }
    
    // Convert the sentiment analysis results to a formatted string
    public String convertToList(JsonReturn prediction) {
        String[] positive = prediction.getPositive();
        String[] neutral = prediction.getNeutral();
        String[] negative = prediction.getNegative();
        String returnString;
        if (Integer.parseInt(positive[0]) > Integer.parseInt(neutral[0]) && Integer.parseInt(positive[0]) > Integer.parseInt(negative[0])) {
            returnString = String.format("Positive %s", positive[1]);
        } else if (Integer.parseInt(neutral[0]) > Integer.parseInt(negative[0])) {
            returnString = String.format("Neutral %s", neutral[1]);
        } else {
            returnString = String.format("Negative %s", negative[1]);
        }
        System.out.println("TAG_setWordCountData_prediction: " + returnString);
        return prediction.getHash() + " " + returnString;
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