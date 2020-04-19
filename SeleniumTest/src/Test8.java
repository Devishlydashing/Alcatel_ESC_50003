import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/** TEST 8: Multiple Users click 'Next' at the same time.*/
public class Test8 {
    public static final int numberOfPages = 2;
    public static final long timeClickNext = System.currentTimeMillis() + 20000;

    public static void main(String[] args) throws InterruptedException {

        System.out.println("Running Test with " + numberOfPages + " number of Users.");
        System.out.println("Time to click on " + timeClickNext);

        long startTime = System.currentTimeMillis();
        page_1[] page_1 = new page_1[numberOfPages];

        for (int i = 0; i < numberOfPages; i++) {
            page_1[i] = new page_1(timeClickNext);
            long timeNow = System.currentTimeMillis();
            Boolean result = timeNow < timeClickNext;
            System.out.println("Thread " + i + " being started at " + timeNow + " .It is lesser then timeClickNext: " + result);
            page_1[i].start();
        }

        try {
            for (int i = 0; i < numberOfPages; i++) {
                page_1[i].join();
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

class page_1 extends Thread{

    long time;

    public page_1(long time_1){
        time = time_1;
    }

    public void run() {

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

        long currentTime = System.currentTimeMillis();
        boolean result_1 = currentTime < time;
        System.out.println("Target time: " + time);
        System.out.println("Time Now: " + currentTime + " || "  + result_1);
        long timeRem = time - currentTime;
        System.out.println("Time Remaining: " + timeRem);
        while(true){
            long timeNow = System.currentTimeMillis();
            if(timeNow == time){
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

        WebElement end = driver.findElement(By.id("endButton"));
        end.click();
        Alert alert = driver.switchTo().alert();
        alert.accept(); // for OK
//        Thread.sleep(8000);
        // Close the browser
        driver.close();


    }
}