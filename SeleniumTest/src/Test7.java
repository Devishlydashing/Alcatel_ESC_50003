import org.junit.Test;
import org.openqa.selenium.*;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.phantomjs.PhantomJSDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.WebDriver;

import java.io.File;

/** TEST 7: Load based testing.*/
public class Test7 {
    public static final int numberOfPages = 3;
    public static final long timeClickNext = System.currentTimeMillis() + 60000;

    public static void main(String[] args) throws InterruptedException {

        System.out.println("Running Test with " + numberOfPages + " number of Users.");
        System.out.println("Log onto firebase to see if all users have been loaded successfully.");
        System.out.println("If test case is successful all windows should be destroyed by the end.");
        System.out.println("Waiting time is: 1 minute");

        long startTime = System.currentTimeMillis();
        page[] page = new page[numberOfPages];

        for (int i = 0; i < numberOfPages; i++) {
            page[i] = new page(timeClickNext);
            long timeNow = System.currentTimeMillis();
            boolean result = timeNow < timeClickNext;
            System.out.println("Thread " + i + " being started at " + timeNow + " .It is lesser then timeClickNext: " + result);
            page[i].start();
        }

        try {
            for (int i = 0; i < numberOfPages; i++) {
                page[i].join();
            }

        } catch(InterruptedException e) {
            System.out.println("Interrupted");
        }
        long duration = System.currentTimeMillis() - startTime;
        int seconds = (int) (duration / 1000) % 60 ;
        int minutes = (int) ((duration / (1000*60)) % 60);
        int hours   = (int) ((duration / (1000*60*60)) % 24);
        System.out.print("Time used: " + hours + " hours " + minutes + " minutes " + seconds + " seconds.");
    }
}

class page extends Thread{

    long time;

    public page(long time_1){
        time = time_1;
    }

    public void run() {

        //File path = new File("/Users/devbahl/Desktop/SeleniumTest/phantomjs.exe");
        //System.setProperty("phantomjs.binary.path",path.getAbsolutePath());
        //WebDriver driver = new PhantomJSDriver();
        FirefoxDriver driver = new FirefoxDriver();
        driver.get("http://localhost:3000/");

        /** Test 1*/

        // Wait for load
        WebDriverWait wait = new WebDriverWait(driver, 20);
        wait.until(ExpectedConditions.elementToBeClickable(By.id("password")));

        WebElement three = driver.findElement(By.id("password"));
        System.out.println("Password is Selected.");

        three.click();
        /***/

        /** Test 2*/
        WebElement chat = driver.findElement(By.id("chat"));
        System.out.println("Chat is Selected.");

        chat.click();
        /***/

        WebElement next = driver.findElement(By.id("Next"));

        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        long currentTime = System.currentTimeMillis();
        boolean result_1 = currentTime < time;
        System.out.println("Target time: " + time);
        System.out.println("Time Now: " + currentTime + " || "  + result_1);
        long timeRem = time - currentTime;
        System.out.println("Time Remaining: " + timeRem);
        while(true){
            long timeNow = System.currentTimeMillis();
            // Window of time given for all pages to load at roughly the same time.
            // For more precise testing with regards to time, refer to test case 8.
            if(time < timeNow && timeNow < time + 2000){
                next.click();
                driver.switchTo().alert().accept();
                break;
            }
            else{}
        }

        // Wait for the page to be redirected.
        WebDriverWait wait_1 = new WebDriverWait(driver, 20);
        wait_1.until(ExpectedConditions.elementToBeClickable(By.id("endButton")));

        System.out.println("Chat Page Loaded! Time to end---");

        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        WebElement end = driver.findElement(By.id("endButton"));
        end.click();
        Alert alert = driver.switchTo().alert();
        alert.accept(); // for OK
//        Thread.sleep(8000);
        // Close the browser
        driver.close();


    }
}