package gemenielabs.sentiment.DataProcessing;

import static gemenielabs.sentiment.MainActivity.stockDao;

import android.util.Log;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import gemenielabs.sentiment.Room.CombinedWordDetails;
import gemenielabs.sentiment.Room.WordCountDetails;

public class SetCombineWordCountData {

    public List<CombinedWordDetails> combineDates(List<WordCountDetails> wordCountDetails) {

        // Create a new CombinedWordDetails object with default values
        CombinedWordDetails combo = new CombinedWordDetails("", "", 0, 0, 0, "", 0, 0, 0, "");

        // Create a new ArrayList to hold dates
        ArrayList<String> holderDates = new ArrayList<>();

        // Initialize combinedWordDetails to null
        List<CombinedWordDetails> combinedWordDetails = null;

        // Log start of function
        Log.i("TAG_start", "SetcombineWordCountData");

        // Check if wordCountDetails is not empty
        if (wordCountDetails.size() > 0) {

            // Get combinedWordDetails from stockDao using the ticker of the first element in wordCountDetails
            combinedWordDetails = stockDao.getCombinedWordDetails(wordCountDetails.get(0).getTicker());

            // Create a new ArrayList to hold dates from combinedWordDetails
            ArrayList<String> dates = new ArrayList<>();

            // Add dates from combinedWordDetails to dates ArrayList
            for (CombinedWordDetails details : combinedWordDetails) {
                dates.add(details.getDate());
            }

            // Loop through wordCountDetails
            for (int i = 0; i < wordCountDetails.size(); i++) {

                // Get the date of the current element
                String date = wordCountDetails.get(i).getDate();

                // Log the current date
                Log.i("TAG_setCombineWordCountData_newsMostRecentDate", date);

                // Check if holderDates or dates ArrayList contains the current date
                if (holderDates.contains(date) || dates.contains(date)) {
                    continue; // Skip to next iteration of loop
                }

                // Initialize variables for sentiment, number of articles, and number of words
                double possentiment = 0;
                double neutsentiment = 0;
                double negsentiment = 0;
                int posnumberOfArticles = 0;
                int neutnumberOfArticles = 0;
                int negnumberOfArticles = 0;
                int poswords = 0;
                int negwords = 0;

                // Loop through wordCountDetails again to calculate sentiment, number of articles, and number of words
                for (int j = 0; j < wordCountDetails.size(); j++) {

                    // Get the date of the current element
                    String date1 = wordCountDetails.get(j).getDate();

                    // Check if the current element has the same date as the current iteration and is not the same element
                    if (date.equals(date1) && i != j) {

                        // Get the sentiment of the current element
                        String sentString = wordCountDetails.get(j).getSentiment();

                        // Update sentiment variables based on sentiment of current element
                        if (sentString.equals("Positive")) {
                            possentiment += wordCountDetails.get(j).getSentimentNumber();
                            posnumberOfArticles += 1;
                        } else if (sentString.equals("Neutral")) {
                            neutsentiment += wordCountDetails.get(j).getSentimentNumber();
                            neutnumberOfArticles += 1;
                        } else {
                            negsentiment += wordCountDetails.get(j).getSentimentNumber();
                            negnumberOfArticles += 1;
                        }

                        // Update word count variables
                        poswords += wordCountDetails.get(j).getPositive();
                        negwords += wordCountDetails.get(j).getNegative();
                    }
                }

                // Add current date to holderDates ArrayList
                holderDates.add(date);

                // Get the sentiment of the current element
                String sentString = wordCountDetails.get(i).getSentiment();

                // Update word count variables
                poswords += wordCountDetails.get(i).getPositive();
                negwords += wordCountDetails.get(i).getNegative();

                // Update sentiment variables based on sentiment of current element
                if (sentString.equals("Positive")) {
                    possentiment += wordCountDetails.get(i).getSentimentNumber();
                    posnumberOfArticles += 1;
                }
                if (sentString.equals("Neutral")) {
                    neutsentiment += wordCountDetails.get(i).getSentimentNumber();
                    neutnumberOfArticles += 1;
                }
                if (sentString.equals("Negative")) {
                    negsentiment += wordCountDetails.get(i).getSentimentNumber();
                    negnumberOfArticles += 1;
                }

                // Calculate average sentiment if there is more than one article

                if (posnumberOfArticles > 1) {
                    possentiment = possentiment / posnumberOfArticles;
                }
                if (neutnumberOfArticles > 1) {
                    neutsentiment = neutsentiment / neutnumberOfArticles;
                }
                if (negnumberOfArticles > 1) {
                    negsentiment = negsentiment / negnumberOfArticles;
                }

                // Log sentiment values
                Log.i("TAG_setCombineWordCountData_setSentiment:", "pos " + posnumberOfArticles + " " + possentiment +
                      " neut " + neutnumberOfArticles + " " + neutsentiment + " neg " + negnumberOfArticles + " " + negsentiment);

                // Set sentiment based on highest sentiment value
                if (possentiment > negsentiment && possentiment > neutsentiment) {
                    combo.setSentiment("POS");
                } else if (neutsentiment > negsentiment) {
                    combo.setSentiment("NEUT");
                    possentiment = neutsentiment;
                } else {
                    combo.setSentiment("NEG");
                    possentiment = negsentiment;
                }

                // Set sentiment based on highest number of articles
                if (posnumberOfArticles > neutnumberOfArticles && posnumberOfArticles > negnumberOfArticles) {
                    combo.setSentiment("POS");
                }
                if (neutnumberOfArticles > negnumberOfArticles && neutnumberOfArticles > posnumberOfArticles) {
                    combo.setSentiment("NEUT");
                    possentiment = neutsentiment;
                }
                if (negnumberOfArticles > neutnumberOfArticles && negnumberOfArticles > posnumberOfArticles) {
                    combo.setSentiment("NEG");
                    possentiment = negsentiment;
                }

                // Set sentiment to "No News Data" if there is no news data
                if (sentString.equals("No News Data")) {
                    combo.setSentiment("No News Data");
                }

                // Set remaining variables for CombinedWordDetails object
                combo.setPositive(poswords);
                combo.setNegative(negwords);
                combo.setDate(date);
                combo.setNextDay(wordCountDetails.get(i).getNextDay());
                combo.setTwoWks(wordCountDetails.get(i).getTwoWks());
                combo.setOneMnth(wordCountDetails.get(i).getOneMnth());
                combo.setTicker(wordCountDetails.get(0).getTicker());
                combo.setSentimentNumber(possentiment);
                combo.setUpdateDate(LocalDate.now().toString());

                // Insert CombinedWordDetails object into database using stockDao
                stockDao.insertCombinedWordDetails(combo);
            }

            // Get combinedWordDetails from stockDao again
            combinedWordDetails = stockDao.getCombinedWordDetails(wordCountDetails.get(0).getTicker());
        }

        // Return combinedWordDetails
        return combinedWordDetails;
    }
}
