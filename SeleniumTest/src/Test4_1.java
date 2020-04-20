import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.concurrent.TimeUnit;

/** TEST 4.1: User is connected to a valid Administrator.*/
public class Test4_1 {
    public static void main(String[] args) throws InterruptedException {
        FirefoxDriver driver = new FirefoxDriver();
        driver.manage().timeouts().pageLoadTimeout(60, TimeUnit.SECONDS);
        driver.manage().timeouts().setScriptTimeout(60, TimeUnit.SECONDS);
        driver.get("http://localhost:3000/");


        /** Test 1*/

        // Wait for the page to be redirected.
        WebDriverWait wait_2 = new WebDriverWait(driver, 20);
        wait_2.until(ExpectedConditions.elementToBeClickable(By.id("Next")));

        WebElement three = driver.findElement(By.id("others"));
        // Check if Issue 3 is found by Selenium
        System.out.println("Others is Selected.");

        // Select Issue 3
        three.click();

        Thread.sleep(2000);

        /***/

        /** Test 2*/
        WebElement chat = driver.findElement(By.id("Chat"));
        // Check if chat is found by Selenium
        System.out.println("Chat is Selected.");

        // Select Issue 3
        chat.click();

        Thread.sleep(2000);

        /***/

        /** Test 3*/
        WebElement next = driver.findElement(By.id("Next"));
        next.click();

        Thread.sleep(2000);

        // Dismiss the alert.
        driver.switchTo().alert().accept();

        // Wait for the page to be redirected.
        WebDriverWait wait = new WebDriverWait(driver, 60);
        wait.until(ExpectedConditions.elementToBeClickable(By.id("endButton")));

        Thread.sleep(5000);
        /***/


        WebElement textarea = driver.findElement(By.id("sendBox"));
        textarea.sendKeys("I've been connected to an Admin!");
        Thread.sleep(2000);
        WebElement send = driver.findElement(By.id("sendButton"));
        send.click();
        Thread.sleep(5000);
        WebElement end = driver.findElement(By.id("endButton"));
        end.click();
        Thread.sleep(2000);
        Alert alert = driver.switchTo().alert();
        alert.accept(); // for OK
        Thread.sleep(3000);
        // Close the browser
        driver.close();


    }
}