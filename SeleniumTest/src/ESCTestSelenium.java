import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

public class ESCTestSelenium {

    public static void main(String[] args) throws InterruptedException {
        FirefoxDriver driver = new FirefoxDriver();
        driver.get("https://sudiptac.bitbucket.io/");
        WebElement element = driver.findElement(By.linkText("ASSET Research Group"));
        element.click();
        
        Thread.sleep(2000);
        driver.close();
    }
}

