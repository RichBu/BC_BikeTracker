pragma solidity ^0.4.18;

contract Token {
    string public name = 'Bicyle List';    
    address public storeOwner;
    uint256 nextRecNum;
    struct bikeRec {
        address currOwner;
        string mfg;
        string serialNum;
    }

    //make an array of the custom struct 
    mapping ( uint256 => bikeRec ) bikeRecAll; 
    string[] bikeRecList;  //not really used but can use to count records
    //bikeRec[] public bikeRecList;

    // address[] public ownerList;
    // bytes32[] public mfgList;
    // bytes32[] public snList;
    

    constructor(){
        //store owner is the first person on the chain
        storeOwner = msg.sender;
        nextRecNum = 0;
    }


    function setBike_rec( string _mfg, string _sn) external returns(uint256 _recNum){
        require( msg.sender == storeOwner );
        require( (bytes(_mfg).length<=50) && (bytes(_sn).length<=50) );
        uint256 recNum = nextRecNum++;
        //next line returns a pointer to the location to write to
        //it should automatically generate a new address based on the mapping
        /* this is old way of doing
        bikeRec newBikeRec = bikeRecAll[ recNum ];
        newBikeRec.currOwner = msg.sender;
        newBikeRec.mfg = _mfg;
        newBikeRec.serialNum = _sn;
        nextRecNum++;
        */
        //try now with constructor
        bikeRecAll[recNum] = bikeRec( msg.sender, _mfg, _sn );
        return recNum;
    }   
    

    function getBike_rec( uint256 _recNum ) view external returns( address, string, string) {
        require( _recNum <= nextRecNum );
        bikeRec memory br = bikeRecAll[_recNum];
        return ( br.currOwner, br.mfg, br.serialNum );
    }


    function transfer(address _to, uint256 _recNum ) external returns(address, string, string, bool){
        if ( isPersonOwner( msg.sender, _recNum  ) == true ) {
            //person is valid owner
            //only need to change the owner everything else stays the same
            bikeRec storage br = bikeRecAll[_recNum];
            br.currOwner = _to;
            return ( br.currOwner, br.mfg, br.serialNum, true );
        } else {
            return( br.currOwner, 'you are not owner', '', false );
        }
    }


    function isPersonOwner( address _to, uint256 _recNum ) public view returns(bool) {        

        if ( _recNum < bikeRecList.length  ) {
            return false;
        }
        bikeRec memory br = bikeRecAll[_recNum];

        if ( br.currOwner == _to  ) {
            return true;
        }
        return false;
    }

    function getBikesCount() public view returns (uint256) {
        return nextRecNum;
    }
}
