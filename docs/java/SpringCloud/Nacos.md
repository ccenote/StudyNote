# Nacos

## 安装Nacos

## 服务注册到Nacos

1. 在父工程中添加`spring-cloud-alibaba-dependencies`

   ``` xml
   <dependency>
       <groupId>com.alibaba.cloud</groupId>
       <artifactId>spring-cloud-alibaba-dependencies</artifactId>
       <version>2.2.6.RELEASE</version>
       <type>pom</type>
       <scope>import</scope>
   </dependency>
   ```

2. 添加nacos的客户端依赖 `spring-cloud-starter-alibaba-nacos-discovery`

3. 修改子工程的`application.yml`文件

   ``` yaml
   spring:
   	cloud:
   		nacos:
   			server-addr: localhost:8848
   ```

## Nacos配置集群

``` yaml
spring:
	cloud:
		nacos:
			server-addr: localhost:8848
			discovery:
				cluster-name: HZ #配置集群名称
```

## 根据集群负载均衡

``` yaml
spring:
	cloud:
		nacos:
			server-addr: localhost:8848
			discovery:
				cluster-name: HZ #配置集群名称
userservice:
	ribbon:
		NFLoadBalancerRuleClassName: com.alibaba.cloud.nacos.ribbon.NacosRule #负债均衡规则
```

`NacosRule`负载均衡策略

1. 优先选择同集群服务实例列表
2. 本地集群找不到提供者，才去其他集群寻找，并且会报警告
3. 确定了可用实例列表后，再采用随机负载均衡挑选实例

## 根据权重负载均衡

实际部署中如果出现服务器设备性能有差异，部分实例所在机器性能较好，另一些较差，我们希望性能好的机器承担更多的用户请求

Nacos提供了权重配置来控制访问频率，权重越大访问频率越高

1. 在Nacos控制台可以设置实例的权重值 `0~1`之间

2. 环境隔离

   Nacos中服务存储和数据存储的最外层都有一个名为namespace的东西，用来做最外层隔离

   1. 在Nacos控制台可以创建 namespace 用来隔离不同环境

   2. 生成后会出现一个命名空间 Id

   3. 在子服务中添加配置

      ``` yaml
      cloud:
      	nacos:
      		server-addr: localhost:8848
      		discovery:
      			cluster-name: SH
      			namespace: 命名空间Id
      ```

3. 临时实例

   服务注册到Nacos时，可以选择为临时或非临时实例

   ``` yaml
   spring:
   	cloud:
   		nacos:
   			discovery:
   				ephemeral: false
   ```

   临时实例宕机时，会从nacos的服务列表中剔除，而非临时实例则不会

## 统一配置管理

1. 在Nacos中添加配置信息

2. 配置文件id：服务名称-profile.后缀名

3. 子服务中引入Nacos的配置管理客户端依赖：`spring-cloud-starter-alibaba-nacos-config`

4. 在子服务中的resource目录中添加一个`bootstrap.yml`文件，这个文件是引导文件，优先级高于`application.yml`

   编写：

   ``` yaml
   spring:
   	application:
   		name: userservice
   			profiles:
   		active: dev
   			cloud:
   		nacos:
   			server-addr: localhost:8848
   				config:
   					file-extension: yaml
   ```

5. 配置自动刷新

   Nacos中的配置文件变更后，微服务无需重启就可以感知：

   1. 在@Value注入的变量所在类上添加注解`@RefreshScope`

   2. 使用@`ConfigurationProperties`注解

      ``` java
      @Component
      @Data
      @ConfigurationProperties(prefix="pattern")
      public class PatternProperties{
          private String dateformat;
      }
      ```

6. 多环境配置共享

   微服务启动时会从nacos读取多个配置文件：

   - [spring.application.name]-[spring.profiles.active].yaml 例如：userservice-dev.yaml
   - [spring.application.name].yaml 例如：userservice.yaml

   无论profile如何变化，[spring-application.name].yaml这个文件一定会加载，因此多环境共享配置可以写入这个文件

   优先级：[服务名]-[环境].yaml > [服务名].yaml > 本地配置