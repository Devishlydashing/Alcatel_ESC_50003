import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

/** TEST 2: User is able to select his preferred Means of Communication*/
public class Test2 {
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

        WebElement chat = driver.findElement(By.id("chat"));
        // Check if chat is found by Selenium
        System.out.println("Chat is Selected.");

        //Thread.sleep(2000);

        // Select Issue 3
        chat.click();

        Thread.sleep(2000);

        // Dismiss the alert.
        //driver.switchTo().alert().accept();

        //Thread.sleep(2000);

        // Close the browser
        driver.close();

    }
}