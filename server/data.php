<?php 

	error_reporting(E_ALL);
	ini_set('display_errors', 'On');
	
	require(dirname(__FILE__) . '/lib/meekrodb.2.0.class.php');
	
	DB::$user = '';
	DB::$password = '';
	DB::$dbName = '';
	DB::$host = '';
	DB::$error_handler = false; 
	DB::$throw_exception_on_error = true; 
	

	switch ($_SERVER['REQUEST_METHOD']) {
		 
		case 'POST': 
			$table = $_GET['collection']; 
			$data = json_decode(file_get_contents('php://input'), true);
			
			try {
				DB::insert($table, $data);
				$lastID = DB::insertId(); 
				$response = array('id'=>$lastID);
				echo json_encode($response);
			} catch(MeekroDBException $e) {
				$error = $e->getMessage().'---'.$e->getQuery();
				echo $error;
			}
			break;
			
		case 'GET':
			$table = $_GET['collection'];
			if($_GET['top']) {
				$limit = $_GET['top'];
			}else {
				$limit = 100;
			}
			if($_GET['skip']) {
				$start = $_GET['skip'];
			}else {
				$start = 0;
			}
			try {
				$result = DB::query('SELECT * FROM articles ORDER BY id DESC LIMIT '.$start.','.$limit);
				echo json_encode($result);
			} catch(MeekroDBException $e) {
				$error = $e->getMessage().'---'.$e->getQuery();
				echo $error;
			}
			break;
			
		case 'PUT':
			$table = $_GET['collection']; 
			$data = json_decode(file_get_contents('php://input'), true);
			
			try {
				DB::replace($table, $data);
				$lastID = DB::insertId(); 
				$response = array('id'=>$lastID);
				echo json_encode($response);
			} catch(MeekroDBException $e) {
				$error = $e->getMessage().'---'.$e->getQuery();
				echo $error;
			}
			break;
			
		case 'DELETE':
			$table = $_GET['collection'];
			$id = $_GET['id'];
			$vars = array();
			
			try {
				DB::delete($table, "id=%s", $id);
				$lastID = DB::insertId();
				$response = array('id'=>$lastID);
				echo json_encode($response);
			} catch(MeekroDBException $e) {
				$error = $e->getMessage().'---'.$e->getQuery();
				echo $error;
			}
			break;
	}