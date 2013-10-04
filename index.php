<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Engage</title>
    <link href="client/css/base.css" rel="stylesheet" />
    <link href="client/css/style.css" rel="stylesheet" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript"></script>
	<script src="client/lib/underscore.js"></script>
    <script src="client/lib/backbone.js"></script>
    <script src="client/lib/backbone.paginator.js"></script>
    <script src="client/js/app.js"></script>
    
</head>

<body class="main">
    <div id="app">
    	<header class="clearfix">
            <a id="add-article"></a>
            <!--<a id="crypt-mode"></a>-->
        </header>
        <div id="wrapper">
            <div id="main">
            	<section><img class="loading" src="client/images/loading.gif" /></section>
            	<a class="show-more">MORE</a>
            </div>
        </div>
    </div>
    <script type="text/template" id="article-template">
    		<div class="article-wrap clearfix">
	    		<div data-id="<%= cid %>" class="editable <%  if(!inCryptMode) { %>decrypted<%}%>" contenteditable="true"><%= content %></div>
	    		<div class="article-controls">
					<a class="html-toggle <% if(isHTML == 1) { %>on<%}%>">HTML</a>
					<a class="delete-article-btn">-</a>
				</div>
				<div class="editing-overlay"></div>
			</div>
    </script>  
</body>
</html>
