import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/** TEST 5.2: User is able to End Call.*/
public class Test5_2 {
    public static void main(String[] args) throws InterruptedException {
        FirefoxDriver driver = new FirefoxDriver();
        driver.get("http://localhost:3000/");


        /** Test 1*/
        WebElement three = driver.findElement(By.id("password"));
        // Check if Issue 3 is found by Selenium
        System.out.println("Password is Selected.");

        Thread.sleep(5000);

        // Select Issue 3
        three.click();

        Thread.sleep(2000);

        // Dismiss the alert.
        //driver.switchTo().alert().accept();

        //Thread.sleep(2000);
        /***/

        /** Test 2*/
        WebElement chat = driver.findElement(By.id("call"));
        // Check if chat is found by Selenium
        System.out.println("Chat is Selected.");

        //Thread.sleep(2000);

        // Select Issue 3
        chat.click();

        Thread.sleep(2000);

        // Dismiss the alert.
        //driver.switchTo().alert().accept();

        //Thread.sleep(2000);
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