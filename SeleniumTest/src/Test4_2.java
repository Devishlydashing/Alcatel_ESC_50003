import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.util.concurrent.TimeUnit;

/** TEST 4.2: User & Admin are able to Send & Receive input.*/
public class Test4_2 {
    public static void main(String[] args) throws InterruptedException {
        FirefoxDriver driver = new FirefoxDriver();
        driver.manage().timeouts().pageLoadTimeout(60, TimeUnit.SECONDS);
        driver.manage().timeouts().setScriptTimeout(60, TimeUnit.SECONDS);
        driver.get("http://localhost:3000/");

        /** Admin Website side */
        FirefoxDriver driver_1 = new FirefoxDriver();
        driver_1.manage().timeouts().pageLoadTimeout(60, TimeUnit.SECONDS);
        driver_1.manage().timeouts().setScriptTimeout(60, TimeUnit.SECONDS);
        driver_1.get("http://127.0.0.1:8887");

        // Wait for the page to be redirected.
        WebDriverWait wait_1 = new WebDriverWait(driver_1, 60);
        wait_1.until(ExpectedConditions.elementToBeClickable(By.name("form")));


        // Input Username and Password.
        System.out.println("We will be using the following Administrator:\n" +
                "John Berry\n" +
                "user: johnBerry@gmail.com \n" +
                "password: j0hnBerry!\n" +
                "id: 5e5c7b276c332176648fe163\n" +
                "----------------------------\n" +
                "His speciality is in Others");
        WebElement username = driver_1.findElement(By.id("username"));
        username.sendKeys("johnBerry@gmail.com");
        WebElement password = driver_1.findElement(By.id("password"));
        password.sendKeys("j0hnBerry!");
        Thread.sleep(2000);
        WebElement signIn = driver_1.findElement(By.className("connectionCmp-btn"));
        signIn.click();


        /***/



        /** Test 1*/

        // Wait for the page to be redirected.
        WebDriverWait wait_2 = new WebDriverWait(driver, 20);
        wait_2.until(ExpectedConditions.elementToBeClickable(By.id("Next")));


        // Wait for Admin to get connected.
        Thread.sleep(10000);
//        WebDriverWait wait_3 = new WebDriverWait(driver_1, 60);
//        WebElement connected = driver_1.findElement(By.className("connectionCmp-state-value ng-binding"));
//        wait_3.until(ExpectedConditions.elementToBeClickable(connected.findElement(By.id("Next"))));


        WebElement three = driver.findElement(By.id("others"));
        // Check if Issue 3 is found by Selenium
        System.out.println("Others is Selected.");

        Thread.sleep(2000);

        // Select Issue 3
        three.click();

        Thread.sleep(2000);

        // Dismiss the alert.
        //driver.switchTo().alert().accept();

        //Thread.sleep(2000);
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

        Thread.sleep(5000);

        // Dismiss the alert.
        driver.switchTo().alert().accept();

        // Wait for the page to be redirected.
        WebDriverWait wait = new WebDriverWait(driver, 20);
        wait.until(ExpectedConditions.elementToBeClickable(By.id("endButton")));

        Thread.sleep(5000);
        /***/


        WebElement textarea = driver.findElement(By.id("sendBox"));
        textarea.sendKeys("OTHERS Test Message");
        Thread.sleep(2000);
        WebElement send = driver.findElement(By.id("sendButton"));
        send.click();
        Thread.sleep(2000);
        WebElement end = driver.findElement(By.id("endButton"));
        end.click();
        Thread.sleep(2000);
        Alert alert = driver.switchTo().alert();
        alert.accept(); // for OK
        Thread.sleep(8000);
        // Close the browser
        driver.close();

    }
}