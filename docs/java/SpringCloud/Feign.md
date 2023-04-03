# Feign

`Feign`的是一个声明式的`Http`客户端，其作用就是帮助我们优雅的实现http请求的发送

`Feign`替代`RestTemplate`

1. RestTemplate方式调用存在的问题

   先来看我们以前利用`RestTemplate`发起远程调用的代码

   ``` java
   String url="http://userservice/user/"+order.getUserId();
   User user=restTemplate.getForObject(url,User.class);
   ```

   存在的问题：

   - 代码可读性差，编程体验不统一
   - 参数复杂`URL`难以维护

## 定义使用Feign客户端

1. 引入`spring-cloud-starter-openfeign`依赖

2. 在子服务的启动类中添加注解开启`Fegin`的功能

   ``` java
   @EnableFeignClients
   @SpringBootApplication
   public class OrderApplication{
       public static void main(String[] args){
           SpringApplication.run(OrderApplication.class,args);
       }
   }
   ```

3. 定义`Feign`

   ``` java
   @FeignClient("userservice")
   public interface UserClient{
       @GetMapper("/user/{id}")
       User findById(@PathVariable("id") Long id);
   }
   ```

4. 使用`Feign`

   ``` java
   @Autowired
   private UserClient userClient;
   public Order queryOrderById(Long orderId){
      	Order order=orderMapper.findById(orderId);
       User user=userClient.findById(order.getUserId());
       order.setUser(user);
       return order;
   }
   
   ```

5. 你可以自定义`Feign`的配置

   `feign.Logger.Level` 修改日志级别，包含不同的级别 `NONE` `BASIC` `HEADERS` `FULL`

   配置`Feign`日志有两种方式

   1. 配置文件方式

      1. 全局生效

         ``` yaml
         feign:
         	client:
         		config:
         			default: #这里用default就是全局配置
         				loggerLevel: FULL
         ```

      2. 局部生效

         ``` yaml
         feign:
         	client:
         		config:
         			userservice: #写服务名称，则是针对某个微服务的配置
         				loggerLevel: FULL
         ```

   2. Java代码方式，需要先声明一个`Bean`:

      ``` java
      public class FeignClientConfiguration{
          @Bean
          public Logger.Level feignLogLevel(){
              return Logger.Level.BASIC;
          }
      }
      ```

      1. 而后如果是全局配置，则把它放到`@EnableFeignClients`这个注解中

         ``` java
         @EnableFeignClients(defaultConfiguration=FeignClientConfiguration.class)
         ```

      2. 如果是局部配配置，则把它放到`@FeignClient`这个注解中

         ``` java
         @FeignClient(value="userservice",configuration=FeignClientConfiguration.class)
         ```

6. Feign的性能优化

   `Feign`底层的客户端实现：

   - `URLConnection` 默认实现，不支持连接池
   - `Apache HttpClient` 支持连接池
   - `OKHttp` 支持连接池

   因此优化`Feign`的性能主要包括：

   - 使用连接池代替默认的`URLConnection`
   - 日志级别，最好用`basic`或`none`

   1. 引入依赖

      ``` xml
      <dependency>
      	<groupId>io.github.openfeign</groupId>
          <artifactId>feign-httpclient</artifactId>
      </dependency>
      ```

   2. 配置连接池

      ``` yaml
      feign:
      	client:
      		config:
      			default:
      				loggerLevel: BASIC
      	httpclient:
      		enabled: true
      		max-connection: 200
      		max-connection-per-route: 50
      ```

7. Feign的最佳实践

   1. 方式一（继承）给消费者的`FeignClient`和提供者的`controller`定义统一的父接口作为标准

      ``` java
      public interface UserApi{
          @GetMapping("/user/{id}")
          User findById(@PathVariable("id") Long id);
      }
      
      
      @FeignClient(value="userservice")
      public interface UserClient extends UserApi{
          
      }
      
      @RestController
      public class UserController implements UserAPI{
          public UserfindById(@PathVariable("id") Long id){
              //实现业务
          }
      }
      ```

   2. 方式二（抽取）将`FeignClient`抽取为独立模块，并且把接口有关的`POJO`，默认的`Feign`配置都放到这个模块中，提供给所有消费者使用

      1. 首先创建一个`module`，命名为`feign-api`，然后引入`feign`的`starter`依赖 
      2. 将`order-service`中编写的`UserClient`、`User`、`DefaultFeignConfiguration`都复制到`feign-api`项目中
      3. 在`order-service`中引入`feign-api`的依赖
      4. 修改`order-service`中的所有与上述三个组件有关的`import`部分，改成导入`feign-api`中的包
      5. 重启测试

   3. 当定义的`FeignClient`不在`SpringBootApplication`的扫描包范围内时，这些`FeignClient`无法使用。有两种解决办法：

      1. 指定`FeignClient`所在包

         ``` java
         @EnableFeignClients(basePackages="cn.itcast.feign.clients")
         ```

      2. 指定`FeignClient`字节码

         ``` java
         @EnableFeignClients(clients={UserClient.class})
         ```