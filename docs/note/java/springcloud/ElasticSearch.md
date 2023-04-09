# ElasticSearch基础

elasticsearch是一款非常强大的开源搜索引擎，具备非常多的强大功能，可以帮助我们从海量数据中快速找到需要的内容。 

 `elasticsearch`结合`kibana`、`Logstash`、`Beats`，也就是`elasticstack(ELK)`。被广泛应用在日志数据分析、实时监控等领域：

![图片](/images/image-20210720194008781.png)

而`elasticsearch`是`elastic stack`的核心，负责存储、搜索、分析数据。

![图片](/images/image-20210720194230265.png)

## 倒排索引

倒排索引的概念是基于MySQL这样的正向索引而言的。

倒排索引中有两个非常重要的概念：

- 文档（Document）用来搜索的数据，其中的每一条数据就是一个文档。例如一个网页、一个商品信息。
- 词条（Term）对文档数据或用户搜索数据，利用某种算法分词，得到的具备含义的词语就是词条。例如：我是程序员，就可以分为：我、是、程序员、程序这样的几个词条。

创建倒排索引是对正向索引的一种特殊处理，流程如下：

- 将每一个文档的数据利用算法分词，得到一个个词条
- 创建表，每行数据包括词条、词条所在文档id、位置等信息
- 因为词条唯一性，可以给词条创建索引，例如hash表结构索引

**正向索引**：

- 优点：
  - 可以给多个字段创建索引
  - 根据索引字段搜索、排序速度非常快
- 缺点：
  - 根据非索引字段，或者索引字段中的部分词条查找时，只能全表扫描。

**倒排索引**：

- 优点：
  - 根据词条搜索、模糊搜索时，速度非常快
- 缺点：
  - 只能给词条创建索引，而不是字段
  - 无法根据字段做排序

## ES的概念

`elasticsearch`中有很多独有的概念，与mysql略有差别，但也有相似之处

1. 文档和字段

   `elasticsearch`是面向文档（Document）存储的，可以是数据库中的一条商品数据，一个订单信息。文档数据会被序列化为json格式后存储在elasticsearch中

2. 索引和映射

   索引（index）就是相同类型的文档的集合

   例如：

   - 所有用户文档，就可以组织在一起，称为用户的索引；

   - 所有的商品的文档，可以组织在一个，称为商品的索引；

   - 所有订单的文档，可以组织在一起，称为订单的索引；

     ![图片](/images/image-20210720203022172.png)

   因此，我们可以把索引当做是数据库中的表

   数据库的表会有约束信息，用来定义表的结构、字段的名称、类型等信息。因此，索引库中就有映射（mapping），是索引中文文档的字段约束信息，类似表的结构约束。

3. mysql与elasticsearch概念对比

   | Mysql  | Elasticsearch | 说明                                                         |
   | ------ | ------------- | ------------------------------------------------------------ |
   | Table  | Index         | 索引（index），就是文档的集合，类似数据库的表（table）       |
   | Row    | Document      | 文档（Document），就是一条条的数据，类似数据库中的行（Row），文档都是JSON格式 |
   | Column | Field         | 字段（Field），就是JSON文档中的字段，类似数据库中的列（Column） |
   | Schema | Mapping       | Mapping（映射）是索引中文档的约束，例如字段类型约束。类似数据库的表结构（Schema） |
   | SQL    | DSL           | DSL是elasticsearch提供的JSON风格的请求语句，用来操作elasticsearch，实现CRUD |

   Mysql：擅长事务类型操作，可以确保数据的安全和一致性

   Elasticsearch：擅长海量数据的搜索、分析、计算

   实际开发中：

   - 对安全性要求较高的写操作，使用mysql实现
   - 对查询性能要求较高的搜索需求，使用elasticsearch实现
   - 两者再基于某种方式，实现数据的同步，保证一致性

## 安装

1. 部署单点ES

   1. 创建网络

      因为我们还需要部署kibana容器，因此需要让es和kibana容器互联。这里先创建一个网络：

      ``` bash
      docker network create es-net
      ```

   2. 拉取镜像

      ``` bash
      docker pull elasticsearch:7.17.7
      ```

   3. 运行容器

      ``` bash
      docker run -d \
      	--name es \
          -e "ES_JAVA_OPTS=-Xms256m -Xmx256m" \
          -e "discovery.type=single-node" \
          -v es-data:/usr/share/elasticsearch/data \
          -v es-plugins:/usr/share/elasticsearch/plugins \
          --privileged \
          --network es-net \
          -p 9200:9200 \
          -p 9300:9300 \
      elasticsearch:7.17.7
      ```

      命令解释：

      - `-e "cluster.name=es-docker-cluster"`：设置集群名称
      - `-e "http.host=0.0.0.0"`：监听的地址，可以外网访问
      - `-e "ES_JAVA_OPTS=-Xms256m -Xmx256m"`：内存大小
      - `-e "discovery.type=single-node"`：非集群模式
      - `-v es-data:/usr/share/elasticsearch/data`：挂载逻辑卷，绑定es的数据目录
      - `-v es-logs:/usr/share/elasticsearch/logs`：挂载逻辑卷，绑定es的日志目录
      - `-v es-plugins:/usr/share/elasticsearch/plugins`：挂载逻辑卷，绑定es的插件目录
      - `--privileged`：授予逻辑卷访问权
      - `--network es-net` ：加入一个名为es-net的网络中
      - `-p 9200:9200`：端口映射配置

      在浏览器中输入：http://192.168.150.101:9200 即可看到elasticsearch的响应结果：

      ![图片](/images/image-20210506101053676.png)

2. 部署kibana

   kibana可以给我们提供一个elasticsearch的可视化界面。

   1. 拉取

      ``` bash
      docker pull kibana:7.17.7
      ```

   2. 部署运行kibana容器

      ``` bash
      docker run -d \
      --name kibana \
      -e ELASTICSEARCH_HOSTS=http://es:9200 \
      --network=es-net \
      -p 5601:5601  \
      kibana:7.17.7
      ```

      - `--network es-net` ：加入一个名为es-net的网络中，与elasticsearch在同一个网络中
      - `-e ELASTICSEARCH_HOSTS=http://es:9200"`：设置elasticsearch的地址，因为kibana已经与elasticsearch在一个网络，因此可以用容器名直接访问elasticsearch
      - `-p 5601:5601`：端口映射配置

      kibana启动一般比较慢，需要多等待一会，可以通过命令查看：

      ``` bash
      docker logs -f kibana
      ```

      此时，在浏览器输入地址访问：http://192.168.150.101:5601，即可看到结果

3. 安装IK分词器

   1. 在线安装

      ``` bash
      #进入容器
      docker exec -it elasticsearch /bin/bash
      #在线下载并安装
      ./bin/elasticsearch-plugin install https://github.com/medcl/elasticsearch-analysis-ik/releases/download/v7.17.7/elasticsearch-analysis-ik-7.17.7.zip
      #退出
      exit
      #重启容器
      docker restart elasticsearch
      ```

   2. IK分词器的两种模式

      1. `ik_smart` 最少切分
      2. `ik_max_word 最细切分

   3. 测试

      ``` json
      GET /_analyze
      {
          "analyzer":"ik_max_Word",
          "text":"java真的太棒了我很喜欢"
      }
      ```

   4. 扩展词词典

      1. 打开IK分词器的config目录：

         `/var/lib/docker/vlumes/es-plugins/_data/ik/config/IKAnalyzer.cfg.xml`

      2. 在IKAnalyzer.cfg.xml配置文件内容添加：

         ``` xml
         <?xml version="1.0" encoding="UTF-8"?>
         <!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
         <properties>
                 <comment>IK Analyzer 扩展配置</comment>
                 <!--用户可以在这里配置自己的扩展字典 *** 添加扩展词典-->
                 <entry key="ext_dict">ext.dic</entry>
         </properties>
         ```

      3. 新建一个ext.dic，可以参考config目录下复制一个配置文件进行修改

         ``` properties
         奥里给
         giao
         ```

      4. 重启elasticsearch

         ``` bash
         docker restart es
         #查看日志
         docker logs -f elasticsearch
         ```

   5. 停用词词典

      1. IKAnalyzer.cfg.xml配置文件内容添加

         ``` xml
         <?xml version="1.0" encoding="UTF-8"?>
         <!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
         <properties>
                 <comment>IK Analyzer 扩展配置</comment>
                 <!--用户可以在这里配置自己的扩展字典-->
                 <entry key="ext_dict">ext.dic</entry>
                  <!--用户可以在这里配置自己的扩展停止词字典  *** 添加停用词词典-->
                 <entry key="ext_stopwords">stopword.dic</entry>
         </properties>
         ```

      2. 在stopword.dic添加停用词

         ``` properties
         政治
         ```

      3. 重启elasticsearch

         ``` bash
         # 重启服务
         docker restart elasticsearch
         docker restart kibana
         
         # 查看 日志
         docker logs -f elasticsearch
         ```

## 索引库操作

索引库就类似数据库表，mapping映射就类似表的结构

我们要向es中存储数据，必须先创建库和表

1. mapping映射属性

   mapping是对索引库中文档的约束，常见的mapping属性包括：

   - `type` 字段数据类型，常见的简单类型有：
     - 字符串：`text` 可分词的文本、`keyword`精确值
     - 数值：`long`、`integer`、`short`、`byte`、`double`、`float`
     - 布尔：`boolean`
     - 日期：`date`
     - 对象：`object`
   - `index` 是否创建索引，默认为true
   - `analyzer` 使用哪种分词器
   - `properties` 该字段的子字段

   例如：

   ``` json
   {
       "age": 21,
       "weight": 52.1,
       "isMarried": false,
       "info": "hello,world",
       "email": "ccenote@163.com",
       "score": [99.1, 99.5, 98.9],
       "name": {
           "firstName": "云",
           "lastName": "赵",
       },
       
   }
   ```

   对应的每个字段映射（mapping）：

   - age：类型为 integer；参与搜索，因此需要index为true；无需分词器
   - weight：类型为float；参与搜索，因此需要index为true；无需分词器
   - isMarried：类型为boolean；参与搜索，因此需要index为true；无需分词器
   - info：类型为字符串，需要分词，因此是text；参与搜索，因此需要index为true；分词器可以用ik_smart
   - email：类型为字符串，但是不需要分词，因此是keyword；不参与搜索，因此需要index为false；无需分词器
   - score：虽然是数组，但是我们只看元素的类型，类型为float；参与搜索，因此需要index为true；无需分词器
   - name：类型为object，需要定义多个子属性
     - name.firstName；类型为字符串，但是不需要分词，因此是keyword；参与搜索，因此需要index为true；无需分词器
     - name.lastName；类型为字符串，但是不需要分词，因此是keyword；参与搜索，因此需要index为true；无需分词器

2. 索引库的CRUD

   1. 创建索引库和映射

      **基本语法：**

      - 请求方式：PUT
      - 请求路径：/索引库名，可以自定义
      - 请求参数：mapping映射

      ``` json
      PUT /索引库名称
      {
        "mappings": {
          "properties": {
            "字段名":{
              "type": "text",
              "analyzer": "ik_smart"
            },
            "字段名2":{
              "type": "keyword",
              "index": "false",
                "copy_to":"all"
            },
            "字段名3":{
              "properties": {
                "子字段": {
                  "type": "keyword"
                }
              }
            },
              "location":{
              "type":"geo_point"
          },
          "all":{
              "type":"text",
              "analyzer":"ik_max_word"
          }
            // ...略
          }
        }
      }
      ```

      几个特殊字段说明：

      - location：地理坐标，里面包含精度、纬度
      - all：一个组合字段，其目的是将多字段的值 利用copy_to合并，提供给用户搜索

      地理坐标说明：

      ![img](/images/image-20210720222110126.png)

      copy_to说明：

      ![img](/images/image-20210720222221516.png)

   

   1. 查询索引库

      **基本语法**：

      - 请求方式：GET

      - 请求路径：/索引库名

      - 请求参数：无

      ``` json
      GET /索引库名
      ```

   2. 修改索引库

      倒排索引结构虽然不复杂，但是一旦数据结构改变（比如改变了分词器），就需要重新创建倒排索引，这简直是灾难。因此索引库**一旦创建，无法修改mapping**。

      虽然无法修改mapping中已有的字段，但是却允许添加新的字段到mapping中，因为不会对倒排索引产生影响。

      ``` json
      PUT /索引库名/_mapping
      {
        "properties": {
          "新字段名":{
            "type": "integer"
          }
        }
      }
      ```

   3. 删除索引库

      **语法：**

      - 请求方式：DELETE

      - 请求路径：/索引库名

      - 请求参数：无

      ``` json
      DELETE /索引库名
      ```

## 文档操作

1. 新增文档

   ``` json
   POST /索引库名/_doc/文档id
   {
       "字段1": "值1",
       "字段2": "值2",
       "字段3": {
           "子属性1": "值3",
           "子属性2": "值4"
       },
       // ...
   }
   ```

2. 查询文档

   ``` json
   GET /{索引库名称}/_doc/{id}
   ```

3. 删除文档

   ``` json
   DELETE /{索引库名}/_doc/id值
   ```

4. 修改文档

   修改有两种方式：

   - 全量修改：直接覆盖原来的文档

     全量修改是覆盖原来的文档，其本质是：

     - 根据指定的id删除文档
     - 新增一个相同id的文档

     **注意**：如果根据id删除时，id不存在，第二步的新增也会执行，也就从修改变成了新增操作了。

     ``` json
     PUT /{索引库名}/_doc/文档id
     {
         "字段1": "值1",
         "字段2": "值2",
         // ... 略
     }
     ```

   - 增量修改：修改文档中的部分字段

     增量修改是只修改指定id匹配的文档中的部分字段

     ``` json
     POST /{索引库名}/_update/文档id
     {
         "doc": {
              "字段名": "新的值",
         }
     }
     ```

## RestAPI

ES官方提供了各种不同语言的客户端，用来操作ES。这些客户端的本质就是组装DSL语句，通过http请求发送给ES。官方文档地址：`https://www.elastic.co/guide/en/elasticsearch/client/index.html`

其中的Java Rest Client又包括两种:

- `Java Low Level Rest Client`
- `Java High Level Rest Client`

我们使用的是`Java High Level Rest Client`

1. 初始化RestClinet

   在`elasticsearch`提供的`api`中，与`elasticsearch`一切交互都封装在一个名为RestHighLevelClient的类中，必须先完成这个对象的初始化，建立与`elasticsearch`的连接。

   1. 导入`RestHighLevelClient`依赖

      ``` xml
      <dependency>
          <groupId>org.elasticsearch.client</groupId>
          <artifactId>elasticsearch-rest-high-level-client</artifactId>
      </dependency>
      ```

   2. 因为`SpringBoot`默认的ES版本是7.6.2，所以我么需要覆盖默认的ES版本：

      ``` xml
      <properties>
          <java.version>1.8</java.version>
          <elasticsearch.version>7.12.1</elasticsearch.version>
      </properties>
      ```

   3. 初始化`RestHighLevelClient`：

      ``` java
      RestHighLevelClient client=new RestHighLevelClient(RestClient.builder(HttpHost.create("http://192.168.150.101")));
      ```

2. 创建索引库

   1. 创建`Request`对象。因为是创建索引库的操作，因此`Request`是`CreateIndexRequest`
   2. 添加请求参数，其实就是`DSL`的`JSON`参数部分。因为`JSON`字符串很长，这里是定义了静态字符串常量`MAAPPING_TEMPLATE`，让代码看起来更优雅
   3. 发送请求，`client.indices()`方法的返回值是`IndicesClient`类型，封装了所有与索引库操作有关的方法。

   创建一个类，定义`mapping`映射的`JSON`字符串常量：

   ``` java
   package cn.itcast.hotel.constants;
   
   public class HotelConstants {
       public static final String MAPPING_TEMPLATE = "{\n" +
               "  \"mappings\": {\n" +
               "    \"properties\": {\n" +
               "      \"id\": {\n" +
               "        \"type\": \"keyword\"\n" +
               "      },\n" +
               "      \"name\":{\n" +
               "        \"type\": \"text\",\n" +
               "        \"analyzer\": \"ik_max_word\",\n" +
               "        \"copy_to\": \"all\"\n" +
               "      },\n" +
               "      \"address\":{\n" +
               "        \"type\": \"keyword\",\n" +
               "        \"index\": false\n" +
               "      },\n" +
               "      \"price\":{\n" +
               "        \"type\": \"integer\"\n" +
               "      },\n" +
               "      \"score\":{\n" +
               "        \"type\": \"integer\"\n" +
               "      },\n" +
               "      \"brand\":{\n" +
               "        \"type\": \"keyword\",\n" +
               "        \"copy_to\": \"all\"\n" +
               "      },\n" +
               "      \"city\":{\n" +
               "        \"type\": \"keyword\",\n" +
               "        \"copy_to\": \"all\"\n" +
               "      },\n" +
               "      \"starName\":{\n" +
               "        \"type\": \"keyword\"\n" +
               "      },\n" +
               "      \"business\":{\n" +
               "        \"type\": \"keyword\"\n" +
               "      },\n" +
               "      \"location\":{\n" +
               "        \"type\": \"geo_point\"\n" +
               "      },\n" +
               "      \"pic\":{\n" +
               "        \"type\": \"keyword\",\n" +
               "        \"index\": false\n" +
               "      },\n" +
               "      \"all\":{\n" +
               "        \"type\": \"text\",\n" +
               "        \"analyzer\": \"ik_max_word\"\n" +
               "      }\n" +
               "    }\n" +
               "  }\n" +
               "}";
   }
   ```

   在测试类中实现创建索引：

   ``` java
   @Test
   void createHotelIndex() throws IOException{
       //创建Request对象
       CreateIndexRequest request=new CreateIndexRequest("hotel");
       //准备请求的参数DSL语句
       request.source(MAPPING_TEMPLATE,XContentType.JSON);
       //发送请求
       client.indices().create(request,RequestOptions.DEFAULT);
   }
   ```

3. 删除索引库

   删除索引库的`DSL`语句非常简单

   ``` json
   DELETE /hotel
   ```

   与创建索引库相比：

   - 请求方式从`PUT`变为`DELETE`
   - 请求路径不变
   - 无请求参数

   所以代码的差异，注意体现在`Request`对象上

   - 创建`Request`对象，这次是`DeleteIndexRequest`对象
   - 准备参数。
   - 发送请求

   ``` java
   @Test
   void testDeleteHotelIndex() throws IOException{
       //创建Request对象
       DeleteIndexRequest request=new DeleteIndexRequest("hotel");
       //发送请求
       client.indices().delete(request,RequestOptions.DEFAULT);
   }
   ```

4. 判断索引库是否存在

   判断索引库是否存在，本质就是查询

   ``` json
   GET /hotel
   ```

   因此与删除的Java代码流程是类似的

   1. 创建`Request`对象，这次是`GetIndexRequest`对象
   2. 准备参数
   3. 发送请求

   ``` java
   @Test
   void testExistsHotelIndex() throws IOException{
       //创建Request对象
       GetIndexRequest request=new GetIndexRequest("hotel");
       //发送请求
       boolean exists=client.indices().exists(request,RequestOptions.DEFAULT);
       //输出
       sout(exists?"索引库已经存在":"索引库不存在");
   }
   ```

5. 总结

   JavaRestClient操作elasticsearch的流程基本类似。核心是client.indices()方法来获取索引库的操作对象。

   索引库操作的基本步骤：

   - 初始化RestHighLevelClient
   - 创建XxxIndexRequest。XXX是Create、Get、Delete
   - 准备DSL（ Create时需要，其它是无参）
   - 发送请求。调用RestHighLevelClient#indices().xxx()方法，xxx是create、exists、delete

## RestClient操作文档

1. 初始化`RestHighLevelClient`

   ``` java
   @SpringBootTest
   public class HotelDocumentTest{
       @Autowired
       private IHotelService hotelService;
       private RestHighLevelClient client;
       @BeforeEach
       void setUp(){
           this.client=new RestHighLevelClient(RestClinet.builder(HttpHost.create("http://192.168.150.101:9200")));
       }
       @AfterEach
       void tearDown() throws IOException{
           this.client.close();
       }
   }
   ```

2. 新增文档

   索引库实体类

   ``` java
   @Data
   @TableName("tb_hotel")
   public class Hotel {
       @TableId(type = IdType.INPUT)
       private Long id;
       private String name;
       private String address;
       private Integer price;
       private Integer score;
       private String brand;
       private String city;
       private String starName;
       private String business;
       private String longitude;
       private String latitude;
       private String pic;
   }
   ```

   与我们的索引库结构存在差异

   `longitude`和`latitude`需要合并为`location`

   因此，我们需要定义一个新的类型，与索引库结构吻合

   ``` java
   package cn.itcast.hotel.pojo;
   
   import lombok.Data;
   import lombok.NoArgsConstructor;
   
   @Data
   @NoArgsConstructor
   public class HotelDoc {
       private Long id;
       private String name;
       private String address;
       private Integer price;
       private Integer score;
       private String brand;
       private String city;
       private String starName;
       private String business;
       private String location;
       private String pic;
   
       public HotelDoc(Hotel hotel) {
           this.id = hotel.getId();
           this.name = hotel.getName();
           this.address = hotel.getAddress();
           this.price = hotel.getPrice();
           this.score = hotel.getScore();
           this.brand = hotel.getBrand();
           this.city = hotel.getCity();
           this.starName = hotel.getStarName();
           this.business = hotel.getBusiness();
           this.location = hotel.getLatitude() + ", " + hotel.getLongitude();
           this.pic = hotel.getPic();
       }
   }
   ```

   步骤：

   1. 根据id查询酒店数据Hotel
   2. 将Hotel封装为HotelDoc
   3. 将HotelDoc序列化为JSON
   4. 创建IndexRequest，指定索引库名和id
   5. 准备请求参数，也就是JSON文档
   6. 发送请求

   代码：

   ``` java
   @Test
   void testAddDocument() throws IOException{
       //根据id查询
       Hotel hotel = hotelService.getById(61083L);
       //转换为文档类型
       HotelDoc hotelDoc=new HotelDoc(hotel);
       //将HotelDoc装json
       String json=JSON.TOJSONString(hotelDoc);
       //准备Request对象
       IndexRequest request=new IndexRequest("hotel").id(hotelDoc.getId().toString());
       //准备JSON文档
       request.source(json,XContentType.JSON);
       //发送请求
       client.index(request,RequestOptions.DEFAULT);
   }
   ```

3. 查询文档

   查询的DSL语句：

   ``` json
   GET /hotel/_doc/{id}
   ```

   非常简单，因此代码大概分两步：

   - 准备Reuqest对象
   - 发送请求

   不过查询的目的是得到结果，解析为HotelDoc，因此难点是结果的解析

   结果是一个JSON，其中文档放在一个`_source`属性中，因此解析就是拿到`_source`，反序列化为Java对象即可

   也是三个步骤：

   - 准备Request对象，这次是查询，所以是GetRequest
   - 发送请求，得到结果，因为是查询，这里调用client.get()方法
   - 解析结果，就是对JSON做反序列化

   代码：

   ``` java
   @Test
   void testGetDocumentById() throws IOException{
       //准备Request
       GetRequest request=new GetRequest("hotel","61082");
       //发送请求，得到响应
       GetResponse response=client.get(request,RequestOptions.DEFAULT);
       //解析响应结果
       String json=response.getSourceAsString();
       HotelDoc hotelDoc=JSON.parseObject(json,HotelDoc.class);
       sout(hotelDoc)
   }
   ```

4. 删除文档

   删除的DSL

   ``` json
   DELETE /hotel/_doc/{id}
   ```

   与查询相比，仅仅是请求方式从DELETE变成了GET

   1. 准备Request对象，因为是删除，这次是DeleteRequest对象。要指定索引库名和id
   2. 准备参数，无参
   3. 发送请求。因为是删除，所以是client.delete()方法

   ``` java
   @Test
   void testDeleteDocument() throws IOException{
       //准备Request
       DeleteRequest request=new DeleteRequest("hotel","61083");
       //发送请求
       Client.delete(request,RequestOptions.DEFAULT);
   }
   ```

5. 修改文档

   在RestClient的Api中，全量修改与新增的API完全一致，判断依据是ID

   - 如果新增时，ID已经存在，则修改
   - 如果新增时，ID不存在，则新增

   代码：

   ``` java
   @Test
   void testUpdateDocument() throws IOException{
       //准备Request
       UpdateRequest request =new UpdateRequest("hotel","61083");
       //准备请求参数
       request.doc("price","952","starName","四钻");
       //发送请求
       client.update(request,RequestOptions.DEFAULT);
   }
   ```

6. 批量导入文档

   利用BulkRequest批量将数据库数据导入到索引库中

   - 利用mybatis-plus查询数据
   - 将查询到的数据转换为文档类型数据
   - 利用JavaRestClient中的BulkRequest批处理，实现批量新增文档

   语法说明：

   批量处理BulkRequest，其本质就是将多个普通的CRUD请求组合在一起发送。

   其中提供了一个add方法，用来添加其他请求：

   可以看到能添加的请求包括：

   - indexRequest 新增
   - UpdateRequest 修改
   - DeleteRequest 删除

   因此Bulk中添加了多个IndexRequest，就是批量新增功能了

   步骤：

   - 创建Request对象，这里是BulkRequest

   - 准备参数，批处理的参数，就是其他Request对象，这里就是多个IndexRequest

   - 发起请求。这里是批处理，调用的方法为client.bulk()方法

     我们在导入数据时，将上述代码改造成for循环处理即可

   代码：

   ``` java
   @Test 
   void testBulkRequest() throws IOException{
       //批量查询酒店数据
       List<Hotel> hotels =hotelService.list();
       //创建Request
       BulkRequest request=new BulkRequest();
       //准备参数，添加多个新增的Request
       for(Hotel hotel:hotels){
           //转换为文档类型HoteDoc
           HotelDoc hotelDoc=new hotelDoc(hotel);
           //创建新增文档的Request对象
           request.add(new IndexRequest("hotel").id(hotelDoc.getId().toString()).source(JSON.toJSONString(hotelDoc),XContentType.JSON));
       }
       //发送请求
       client.bulk(request,RequestOptions.DEFAULT);
   }
   ```

7. 总结

   文档操作的基本步骤：

   - 初始化RestHighLevelClient
   - 创建XxxRequest。XXX是Index、Get、Update、Delete、Bulk
   - 准备参数（Index、Update、Bulk时需要）
   - 发送请求。调用RestHighLevelClient#.xxx()方法，xxx是index、get、update、delete、bulk
   - 解析结果（Get时需要）