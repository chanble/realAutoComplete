<?php
$filter = $_REQUEST['filter'];
$matchModel = $_REQUEST['matchModel'];
$maxNum = $_REQUEST['maxNum'];
$data = array('one','one2', 'two' , 'two1' , 'two2' , 'two3' , 'two4' ,'three', 'four'
			, 'four1', 'four2', 'four3', 'four4', 'four5', 'four6', 'four7', 'four8'
			, 'five', 'five1', 'five2', 'five3', 'five4', 'five5', 'five6', 'five7'
		);
$res = array();
sleep(3);
foreach ($data as $key => $value)
{
	switch ($matchModel)
	{
		case 'every':
			if (stripos($value, $filter) && count($res) < $maxNum)
			{
				$res[] = $value;
			}
			break;
		case 'pre':
			if (substr($value, 0, strlen($filter)) == $filter && count($res) < $maxNum)
			{
				$res[] = $value;
			}
			break;
		default :
			break;
	}
}
echo json_encode($res);
