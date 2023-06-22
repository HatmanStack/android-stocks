# Stocks

Stocks is an app that analyzes news articles to predict stock market movements across different time frames. By employing techniques like bag-of-words and natural language processing (NLP), it assesses the sentiment conveyed in the articles. This app uses multivariate logistic regression to make predictions based on a variety of factors, such as price and volume. Stocks uses serverless microservices to perform complex calculations quickly and efficiently.

## Demo

Click [here](https://www.youtube.com/watch?v=HYekJElfHBM) to access the Youtube demo. You can download the application from the Google Play Store by clicking [here](https://play.google.com/store/apps/details?id=gemenielabs.sentiment).

## Features

<ul>
<li>Sentiment Analysis: The app performs sentiment analysis on news articles using a custom bag-of-words strategy and NLP techniques. It determines the sentiment (positive, negative, or neutral) associated with the news article.</li>
<li>Multivariate Logistic Regression: The app combines sentiment analysis results with other metrics, such as price and volume, to perform multivariate logistic regression. This regression model helps forecast market movements over varied time frames.</li>
<li>Market Forecast: Based on the results of the multivariate logistic regression, the app provides forecasts for market movements. These forecasts can assist users in making informed investment decisions.</li>
<li>Off-Device Calculations: All the complex calculations required for sentiment analysis and multivariate logistic regression are performed off-device. This ensures that the app remains fast and responsive, as the heavy computational tasks are handled by serverless microservices.</li>
</ul>

## Technologies

- 🤖 Android SDK
- 🚀 Android JetPack
- 🗠 [Tiingo](https://www.tiingo.com/) API for Stock Data
- ✨ Sentiment Analysis [microservice](https://github.com/HatmanStack/python-sentiment-analysis)
- 🏎️ Logistic Regression [microservice](https://github.com/HatmanStack/python-logistic-prediction)


## Screenshots

<table>
  <tr>
    <td><img src="https://github.com/HatmanStack/android-stocks/blob/main/pics/sentiment.png" alt="Image 1"></td>
    <td><img src="https://github.com/HatmanStack/android-stocks/blob/main/pics/sentiment1.png" alt="Image 2"></td>
    <td><img src="https://github.com/HatmanStack/android-stocks/blob/main/pics/sentiment2.png" alt="Image 3"></td>
    <td><img src="https://github.com/HatmanStack/android-stocks/blob/main/pics/sentiment3.png" alt="Image 4"></td>
    </tr>
    <tr>
    <td><img src="https://github.com/HatmanStack/android-stocks/blob/main/pics/sentiment4.png" alt="Image 5"></td>
    <td><img src="https://github.com/HatmanStack/android-stocks/blob/main/pics/sentiment5.png" alt="Image 6"></td>
    <td><img src="https://github.com/HatmanStack/android-stocks/blob/main/pics/sentiment6.png" alt="Image 7"></td>
  </tr>
</table>

## Acknowledgements

<ul>
<li>Stocks uses various open-source libraries and services {Jsoup, Gson, okHTTP}. Thank you to the contributors and maintainers of these projects.</li>
<li>Thanks to the Hugging Face community for providing FinBert as an Open Source Project</li>
</ul>

## License

This project is licensed under the terms of the MIT license.
