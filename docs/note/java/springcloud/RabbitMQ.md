# RabbitMQ

## 同步和异步通讯

微服务通讯有同步和异步两种方式：

- 同步通讯：就像打电话，需要实时响应
- 异步通讯：就像发邮件，不需要马上回复。

两种方式各有优劣，打电话可以立即得到响应，但是你却不能跟多个人同时童话。发送邮件可以同时与多个热发送邮件，但是往往响应会有延迟。

1. 同步通讯：

   优点：

   - 时效性较强，可以立即得到结果

   缺点：

   - 耦合度高
   - 性能和吞吐能力下降
   - 有额外的资源消耗
   - 有级联失败问题

2. 异步通讯：

   优点：

   - 吞吐量提升：无需等待订阅者处理完成，响应更快捷
   - 故障隔离：服务没有直接调用，不存在级联失败问题
   - 调用间没有阻塞，不会造成无效的资源占用
   - 耦合度极低，每个服务都可以灵活插拔，可替换
   - 流量削峰：不管发布时间的流量波动多大，都有`Broker`接收，订阅者可以按照自己的速度去处理事件

   缺点：

   - 架构复杂了，业务没有明显的流程线，不好管理
   - 需要依赖于`Broker`的可靠、安全、性能

### RabbitMQ中的一些角色

- `publisher` 生产者
- `consumer` 消费者
- `exchange` 交换机，负责消息路由
- `queue` 队列，存储消息
- `virtualHost` 虚拟主机，隔离不同租户的exchange、queue、消息的隔离

## 安装RabbitMQ

1. 通过docker来拉取

   ``` bash
   docker pull rabbitmq
   ```

2. 运行MQ容器

   ``` bash
   docker run -e RABBITMQ_DEFAULT_USER=cece -e RABBITMQ_DEFAULT_PASS=123123123 -v mq-plugins:/plugins --name mq --hostname mq -p 15672:15672 -p 5672:5672 -d rabbitmq
   ```


## RabbitMQ消息模型

`RabbitMQ` 官方提供了5哥不同的Demo示例，对应了不同的消息模型：

![图片](/images/image-20210717163332646.png)

## 案例

简单的队列模式模型图：

![图片](/images/image-20210717163434647.png)

最基础的消息队列模型，只包括了三个角色

- `publisher` 消息发布者，将消息发送到队列queue
- `queue` 消息队列，负责接受并缓存消息
- `consumer` 订阅队列，处理队列中的消息

1. 导入依赖

   ``` xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-amqp</artifactId>
   </dependency>
   ```

2. publisher实现

   1. 建立连接
   2. 创建Channel
   3. 声明队列
   4. 发送消息
   5. 关闭连接和channel

   ``` java
   //1.建立连接,设置连接参数，分别是主机名、端口号、vhost、用户名、密码
   ConnectionFactory factory=new ConnectionFactory();
   factory.setHost("192.168.150.101");
   factory.setPort(5672);
   factory.setVirtualHost("/");
   factory.setUsername("cece");
   factory.setPassword("123123123");
   //2.建立连接
   Connection connection=factory.newConnection();
   //3.创建通道Channel
   Channel channel=connection.createChannel();
   //4.创建队列
   String queueName="simple.queue";
   channel.queueDeclare(queueName,false,false,false,null);
   //5.发送消息
   String message="hello,world";
   channel.basicPublish("",queueName,null,message.getBytes());
   System.out.printLn("发送消息成功");
   //6.关闭通道和连接
   channel.close();
   connection.close();
   ```

3. consumer实现

   1. 建立连接
   2. 创建Channel
   3. 声明队列
   4. 订阅消息

   ``` java
   //1.建立连接,设置连接参数，分别是主机名、端口号、vhost、用户名、密码
   ConnectionFactory factory=new ConnectionFactory();
   factory.setHost("192.168.150.101");
   factory.setPort(5672);
   factory.setVirtualHost("/");
   factory.setUsername("cece");
   factory.setPassword("123123123");
   //2.建立连接
   Connection connection=factory.newConnection();
   //3.创建通道Channel
   Channel channel=connection.createChannel();
   //4.创建队列
   String queueName="simple.queue";
   channel.queueDeclare(queueName,false,false,false,null);
   //5.订阅消息
   channel.basicConsume(queueName,true,new DefaultConsumer(channel){
       @Override
       public void handleDelivery(String consumerTag,Envelope envelope,AMQP.BasicProperties properties,byte[] body) throws IOException{
           //6.处理消息
           String message=new String(body);
           System.out.println("接收到消息："+message);
       }
   })
   System.out.out.println("等待接收消息");
   ```

4. 总结

   1. 基本消息队列的信息发送流程：
      1. 建立connection
      2. 创建channel
      3. 利用channel声明队列
      4. 利用channel向队列发送消息55
   2. 基本消息队列的消息接收流程：
      1. 建立connection
      2. 创建channel
      3. 利用channel声明队列
      4. 定义consumer的消费行为handleDelivery()
      5. 利用channel将消费者与队列绑定

## SpringAMQP

SpringAMQP是基于RabbitMQ封装的一套模板，并且还利用SpringBoot对其实现了自动装配，使用起来非常方便。

1. SpringAMQP提供了三个功能：

   - 自动声明队列、交换机及其绑定关系

   - 基于注册的监听器模式，异步接收消息

   - 封装了RabbitTemplate工具，用于发送消息

2. Basic Queue 简单队列模型

   1. 在父工程引入依赖`spring-boot-starter-amqp`

      ``` xml
      <dependency>
      	<groupId>org.springframework.boot</groupId>
          <artifactId>spring-boot-starter-amqp</artifactId>
      </dependency>
      ```

   2. 消息发送

      首先配置MQ地址，在publisher服务的application.yml中添加配置：

      ``` yaml
      spirng: 
      	rabbitmq: 
      		host: 192.168.150.101 #主机名
      		port: 5672 #端口
      		virtual-host: / #虚拟机
      		username: cece #用户名
      		passowrd: 123123123 #密码
      ```

      然后在`publisher`服务中利用`RabbitTemplate`实现消息发送：

      ``` java
      //队列名称
      String queueName="simple.queue";
      //消息
      String message="hello,spring amqp!";
      //发送消息
      rebbitTemplate.convertAndSend(queueName,message);
      ```

   3. 消息接收

      首先配置MQ地址，在`consumer`服务的`application.yml`中添加配置

      ```yaml
      spring:
      	rabbitmq:
      		host: 192.168.150.101
      		port: 5672
      		virtual-host: /
      		username: cece
      		password: 123123123
      ```

      然后在consumer服务中接收

      ``` java
      @Component
      public class SpringRabbitListener{
          @RabbitListener(queues="simple.queue")
          public void listenSimpleQueueMessage(String msg) throws InterruptedException{
              System.out.println("spring 消费者接收到的消息："+msg);
          }
      }
      ```

      测试`consumer`服务，然后在`publisher`服务中运行测试代码，发送MQ消息

## WorkQueue

`Work queues`，也被称为（`Task queues`），任务模型。简单来说就是让多个消费者绑定到一个队列，共同消费队列中的消息。

![图片](/images/image-20210717164238910.png)

当消息处理比较耗时的时候，可能生产消息的速度会远远大于消费者的消费速度。长此以往，消息就会堆积越来越多，无法及时处理。

此时就可以使用`work`模型，多个消费者共同处理消息，速度就能大大提高了。

1. 消息发送

   在`publisher`服务中模拟大量消息堆积的现象

   ``` java
   //队列名称
   String queueName="simple.queue";
   //消息
   String message="hello,message_";
   //发送消息
   for(int i=0;i<50;i++){
       rabbitTemplate.convertAndSend(queueName,message+i);
       Thread.sleep(20);
   }
   ```

2. 消息接收

   要模拟多个消费者绑定同一个队列，我们在`consumer`服务的中添加两个新方法：

   ``` java
   @RabbitListener(queues="simple.queue")
   public void listenWorkQueue1(String msg) throws InterruptedException{
       System.out.println("消费者1接收到消息："+msg+LocalTime.now());
       Thread.sleep(20);
   }
   @RabbitListener(queues="simple.queue")
   public void listenWorkQueue2(String msg) throws InterruptedException{
       System.err.println("消费者2接收到消息："+msg+LocalTime.now());
       Thread.sleep(200);
   }
   ```

   注意到这个消费者`sleep`了1000秒，模拟任务耗时。

3. 测试

   启动`ConsumereApplication`后，在执行`publisher`服务中刚刚编写的发送测试方法`testWorkQueue`.

   可以看到消费者1很快完成了自己的25条消息。消费者2却在缓慢的处理自己的25条消息。

   也就是说消息是平均分配给每个消费者，并没有考虑到消费者的处理能力，这样显然是有问题的。

4. 能者多劳

   在`spring`中有一个简单的配置，可以解决这个问题。我们可以修改`consumer`服务中的`application.yml`文件，添加配置

   ``` yaml
   spring:
   	rabbitmq:
   		listener:
   			simple:
   				prefetch: 1 #每次只能获取一条消息，处理完成才能获取下一个消息
   ```

5. 总结

   `Work`模型的使用：

   - 多个消费者绑定到一个队列，同一条消息指挥被一个消费者处理
   - 通过设置`prefetch`来控制消费者预取的消息数量

## 发布/订阅

发布订阅的模型如图：

![图片](/images/image-20210717165309625.png)

可以看到，在订阅模型中，多了一个`exchange`角色，并且过程略有变化：

- `Publisher` 生产者，也就是要发送消息的程序，但是不在发送到队列中，而是发送X（交换机）
- `Exchange` 交换机，图中的X。一方面，接收生产者发送的消息。另一方面，知道如何处理消息，例如递交给某个特别队列、递交给所有队列、或者是将消息丢弃。到底如何操作，取决于`Exchange`的类型。`Exchange`有以下3种类型：
  - `Fanout` 广播，将消息交给所有绑定到交换机的队列
  - `Direct` 定向，吧消息交给符合指定`routing key`的队列
  - `Topic` 通配符，把消息交给符合`routing pattern`（路由模式）的队列
- `Consumer` 消费者，与以前一样，订阅队列，没有变化
- `Queue` 消息队列与以前一样，接收消息、缓存消息

`Exchange`（交换机）只负责转发消息，不具备存储消息的能力，因此如果没有任何队列与`Exchange`绑定，或者没有符合路由规则的队列，那么消息会丢失!

## Fanout

Fanout,英文翻译是扇出，我觉得在MQ中叫广播更合适。

![图片](/images/image-20210717165438225.png)

在广播模式下，消息发送流程是这样的：

1. 可以有多个队列
2. 每个对垒都要绑定`Exchange`（交换机）
3. 生产者发送的消息，只能发送到交换机，交换机决定要发送给哪个队列，生产者无法决定
4. 交换机把消息发送给绑定过的所有队列
5. 订阅队列的消费者都能拿到消息

1. 在`consumer`中创建一个类，声明队列和交换机：

   ``` java
   @Configuration
   public class FanoutConfig{
       //声明交换机
       @Bean
       public FanoutExchange fanoutExchange(){
           return new FanoutExchange("cece.fanout");
       }
       //第一个队列
       @Bean
       public Queue fanoutQueue1(){
           return new Queue("fanout.queue1");
       }
       //绑定队列和交换机
       @Bean
       public Binding bindingQueue1(Queue fanoutQueue1,FanoutExchange fanoutExchange){
           return BindingBuilder.bind(fanoutQueue1).to(fanoutExchange);
       }
       //第二个队列
       @Bean
       public Queue fanoutQueue2(){
           return new Queue("fanout.queue2");
       }
       //绑定队列和交换机
       @Bean
       public Binding bindingQueue2(Queue fanoutQueue2,FanoutExchange fanoutExchange){
           return BindingBuilder.bind(fanoutQueue2).to(fanoutExchange);
       }
   }
   ```

2. 消息发送

   在`publisher`服务中的`SpringAmqpTest`类中添加测试方法：

   ``` java
   @Test
   public void testFanoutExchange(){
       //队列名称
       String exchangeName="cece.fanout";
       //消息
       String message="hello,everyone!";
       rabbitTemplate.convertAndSend(exchangeName,"",message);
   }
   ```

3. 消息接收

   在`consumer`服务的`SpringRabbitListener`中添加两个方法，作为消费者：

   ``` java
   @RabbitListener(queues="fanout.queue1")
   public void listenFanoutQueue1(String msg){
       System.out.println("消费者1接收到Fanout消息："+msg);
   }
   @RabbitListener(queues="fanout.queue2")
   public void listenFanoutQueue2(String msg){
       System.out.println("消费者2接收到Fanout消息："+msg);
   }
   ```

4. 总结

   交换机的作用是声明？

   - 接收`publisher`发送的消息
   - 将消息按照规则路由到与之绑定的队列
   - 不能缓存消息，路由失败，消失丢失
   - `FanoutExchange` 的会将消息路由到每个绑定的队列

   声明队列、交换机、绑定关系的Bean是什么？

   - Queue
   - FanoutExchange
   - Binding







