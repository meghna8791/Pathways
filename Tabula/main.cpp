/*
    Sifteo parameter token code
    Copyright (C) 2014 by LSU CCT (team lead by Brygg Ullmer and Chris Branton)
    Major authors: Michael Lynn, Charles Werther

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

    Builds upon Sifteo SDK Example.
*/

#include <sifteo.h>
#include "assets.gen.h"



/**	\def NUM_CUBES
*	\brief number of cubes used
*/
#define NUM_CUBES 3

using namespace Sifteo;

/**	\var M
*	sifteo metadata for project
*/
static Metadata M = Metadata()
    .title("Tabula")
    .package("edu.lsu.cct.tabula", "0.5.0")
    .icon(Icon)
    .cubeRange(1, NUM_CUBES);

/** \var gMainSlot
*	\brief add assests to project
*
*	adds assests listed in assests.lua to project
*/
AssetSlot gMainSlot = AssetSlot::allocate()
    .bootstrap(BootstrapAssets);



/** \var vbuf[]
*	creates video buffer for each cube
*/
static VideoBuffer vbuf[NUM_CUBES];

/** \var motion[]
*	
*/
static TiltShakeRecognizer motion[NUM_CUBES]; 

/** \var tilt[]
*	
*/
static Byte3 tilt[NUM_CUBES];


Int2 bar_idx_tl = vec(3,11);

/**	\var update[]
*	deals with updating the graphics of each cubes
*/
bool update[NUM_CUBES];

//deals with whether a cube is remote or local
/**	\var local[]
*	flag- true if parameter is being manipulated locally
*/
bool local[NUM_CUBES];

/**	\var remote[]
*	flag- true if parameter is being manipulated remotely
*/
bool remote[NUM_CUBES];

//deals with the different text displayed on the screen
/**	\var param[][]
*	array for outputing param to screen
*/
char param[NUM_CUBES][4];

/**	\var minVal[][]
*	array for outputing minVal to screen
*/
char minVal[NUM_CUBES][3];

/**	\var maxVal[][]
*	array for outputing maxVal to screen
*/
char maxVal[NUM_CUBES][3];

/**	\var bar_idx[][]
*	array for outputing bar_idx to screen
*/
int bar_idx[NUM_CUBES];

//for displaying the number transferred through pathways

char Val[NUM_CUBES][3];

//for storing the binding data with the elements on the table
//Bound to nothing if element=0 , molecule if element=1, enzyme if element = 2, Reaction element =3 
int boundTo[NUM_CUBES]={0};
//states of the cubes
int state[NUM_CUBES]={0};
 


void ReadPacket();
void WritePacket(int type, int packetLength, unsigned char* message);


class EventSensor {
public:
    void install ()
    {
        Events::cubeAccelChange.set(&EventSensor::onAccelChange, this);
        Events::cubeTouch.set(&EventSensor::onTouch, this);
       //Events::cubeConnect.set(&EventSensor::onConnect, this);
        Events::neighborAdd.set(&EventSensor::onNeighborAdd,this);
    }

private:
    void onConnect(unsigned id)
    {
        CubeID cube(id);

        LOG("Cube %d connected\n", id);

        vbuf[id].attach(id);
        vbuf[id].initMode(BG0_SPR_BG1);
        vbuf[id].bg0.image(vec(0,0), Background);
        motion[id].attach(id);

        // Draw initial state for all sensors
        onAccelChange(cube);
        onTouch(cube);
        onNeighborAdd(cube,cube,0,1);
    }

    void onTouch(unsigned id)
    {   
        CubeID cube(id);
        
        LOG("Cube %d touched\n",id);

        bool isTouching = cube.isTouching();
        unsigned char message[2];
        //the first byte is the cube id
        message[0] = id;
        //the second byte is 1 if the touch is starting or 0 if ending
        message[1] = isTouching ? 1 : 0;
        //the message type is 0x1 and the length of the message is 1
        //include the tilt value so that we can differentiate between molecule and enzyme
        
        
        WritePacket(0x1, 2, &message[0]); //original
        

      
    }

    void onAccelChange(unsigned id)
    {   CubeID cube(id);
        
        

        unsigned changeFlags = motion[id].update();
        if (changeFlags)
        {   tilt[id]= motion[id].tilt;

            LOG("flags changes \n");

            if (motion[id].shake){

                LOG("Cube %d Shaken  \n", id);

                //unbind the cube 
                boundTo[id] = 0;

                unsigned char message;
                 message = id;
                //the packet type is 0x2 and the length of the message is 1
                WritePacket(0x2, 1, &message);
            }
            //Meghna's changes
            if(tilt[id].x!=0){

                    LOG("Cube %d tilted and the value is %d \n",id,tilt[id].x);
                    
                    unsigned char message[2];
                    message[0] = id;
                    message[1] = tilt[id].x;
                    update[id] = true;
                    WritePacket(0X7,2,&message[0]);
            }
        }
        
    }

    //to add neighbors 
    void onNeighborAdd(unsigned id1 , unsigned side1,unsigned id2,unsigned side2 ){
    CubeID cube(id1);
    NeighborID cube1(id2);

    LOG("Cube ids %d & %d touched each other",id1,id2);
    //LOG("second cube connected %d",id2);
      unsigned char message[4];
      message[0] = id1;
      message[1] = id2;
      message[2]=side1;
      message[3]=side2;
      WritePacket(0x6,4,&message[0]);

    }
};

union convertUint64ToUint8_t
{
    uint64_t myUint64;
    unsigned char arrayValue[8];
};

void SendInitialData()
{
    //send which cube number is assoiated with which which hardware id
    //format is cube number, hardware number

    unsigned char messageHWID[9];
    convertUint64ToUint8_t hwid;
    for (int i=0; i<NUM_CUBES; i++)
    {

        messageHWID[0] = i;
        CubeID cube(i);
        hwid.myUint64 = cube.hwID();    
        unsigned char tempValue;
        for (int j=0; j<8; j++)
        {
            messageHWID[j+1] = hwid.arrayValue[j];
        }    

        WritePacket(0x3, 9, &messageHWID[0]);
    }


    //send which data is bound to which cube ID
    unsigned char message[2];
    for (int i=0; i<NUM_CUBES; i++)
    {
        //a message is sent for each cube
        //format = 3 for type, cube id, and a predefined constant
        
        message[0] = i;
        message[1] = param[i][0];
        WritePacket(0x4, 2, &message[0]); 
    }
}

UsbPipe <10,10> usbPipe;
//added for USB communication



void main() {

    static EventSensor event;

    event.install();     //add motion detection

    

    //SendInitialData();

    for (int i = 0; i < NUM_CUBES; i++)
    {
        CubeID cube(i);
        uint64_t hwid = cube.hwID();

        LOG("Cube %d connected\n", i);

        vbuf[i].attach(i);
        vbuf[i].initMode(BG0_SPR_BG1);
        vbuf[i].bg0.image(vec(0,0), Data);
        motion[i].attach(i);



        //drawing to bg1
        //vbuf[i].bg1.setMask((BG1Mask::filled(vec(2,4), vec(12,3))));  //for the text
        
        

        //init to SQFT
        /*
        param[i][0] = 'S';
        param[i][1] = 'Q';
        param[i][2] = 'F';
        param[i][3] = 'T';
    */
        
        

        minVal[i][0] = ' ';
        minVal[i][1] = '0';
        minVal[i][2] = ' ';

        maxVal[i][0] = '0';
        maxVal[i][1] = '.';
        maxVal[i][2] = '1';

        Val[i][0] = '0';
        Val[i][1] = '.';
        Val[i][2] = '0';


        //add numbers for status bar
        vbuf[i].bg1.text(vec(2,4), Font, Val[i]);
       

       
     

        update[i] = false;
    }


    //needed to actually use usb pipe
    usbPipe.attach();
    //register with event
    Events::usbReadAvailable.set(&ReadPacket);

    SendInitialData();

    // run loop
    while(1) {

        //iterate through the cubes to determine if they need updated
        for (int i = 0; i < NUM_CUBES; i++)
        {
            if (update[i])
            {
                vbuf[i].bg0.erase();
                vbuf[i].bg1.erase();

                //show the background depending on what it is bound to
                /*if(boundTo[i]==0){              //not bound to anything
                    //not tilted
                    vbuf[i].bg0.image(vec(0,0), Molecule_select);
                    if(tilt[i].x==1){
                            vbuf[i].bg0.image(vec(0,0), Molecule_select);
                    }else 
                         vbuf[i].bg0.image(vec(0,0), Enzyme_select);

                }else if(boundTo[i]==1){    //bound to a molecule
                    vbuf[i].bg0.image(vec(0,0), Molecule_bound_bckg);
                    //define the space
                    
                    vbuf[i].bg1.setMask((BG1Mask::filled(vec(5,5), vec(10,3))));  //for the name
                    vbuf[i].bg1.setMask((BG1Mask::filled(vec(2,9), vec(12,3))));  //for the concentration

                    //write 
                    vbuf[i].bg1.text(vec(5,5), Font, "M");
                    vbuf[i].bg1.text(vec(2,9), Font, Val[i]);



                }else if(boundTo[i]==2){    //bound to an enzyme
                    vbuf[i].bg0.image(vec(0,0), Enzyme_bound_bckg);
                    
                    vbuf[i].bg1.setMask((BG1Mask::filled(vec(5,5), vec(10,3))));  //for the name
                    vbuf[i].bg1.setMask((BG1Mask::filled(vec(2,9), vec(12,3))));  //for the concentration

                    vbuf[i].bg1.text(vec(5,5), Font, "E");
                    vbuf[i].bg1.text(vec(2,9), Font, Val[i]);
                }else {                     //bound to a reaction
                    vbuf[i].bg0.image(vec(0,0), Reaction_bckg);
                    
                    vbuf[i].bg1.setMask((BG1Mask::filled(vec(2,4), vec(10,3))));  //for the reaction constant
                    vbuf[i].bg1.text(vec(2,4), Font, Val[i]);
                }*/
                switch(state[i]){
                    case 0: // Data 
                            vbuf[i].bg0.image(vec(0,0), Data);
                            break;
                    case 1: //Model
                            vbuf[i].bg0.image(vec(0,0), Model);
                            break;
                    case 2: //CSV
                            vbuf[i].bg0.image(vec(0,0), CSV);
                            break;
                    case 3: //RMS
                            vbuf[i].bg0.image(vec(0,0), RMS);
                            break;
                    case 4: //Molecule
                            vbuf[i].bg0.image(vec(0,0), Molecule);
                            break;
                    case 5: //Enzyme
                            vbuf[i].bg0.image(vec(0,0), Enzyme);
                            break;
                    case 6: //MolOverview
                            vbuf[i].bg0.image(vec(0,0), MolOverview);
                            vbuf[i].bg1.setMask((BG1Mask::filled(vec(5,5), vec(10,3))));  //for the name
                            vbuf[i].bg1.setMask((BG1Mask::filled(vec(2,9), vec(12,3))));  //for the concentration

                            //write 
                            vbuf[i].bg1.text(vec(5,5), Font, "M");
                            vbuf[i].bg1.text(vec(2,9), Font, Val[i]);
                            break;
                    case 7: //MolConc
                            vbuf[i].bg0.image(vec(0,0), MolConc);
                            break;
                    case 8: //MolGraph
                            vbuf[i].bg0.image(vec(0,0), MolGraph);
                            break;
                    case 9: //MolEquation
                            vbuf[i].bg0.image(vec(0,0), MolEquation);
                            break;
                    case 10: //EnzOverview
                            vbuf[i].bg0.image(vec(0,0), EnzOverview);
                            vbuf[i].bg1.setMask((BG1Mask::filled(vec(5,5), vec(10,3))));  //for the name
                            vbuf[i].bg1.setMask((BG1Mask::filled(vec(2,9), vec(12,3))));  //for the concentration

                            vbuf[i].bg1.text(vec(5,5), Font, "E");
                            vbuf[i].bg1.text(vec(2,9), Font, Val[i]);
                            break;
                    case 11: //EnzConc
                            vbuf[i].bg0.image(vec(0,0), EnzConc);
                            break;
                    case 12: //RctOverview
                            vbuf[i].bg0.image(vec(0,0), RctOverview);
                            vbuf[i].bg1.setMask((BG1Mask::filled(vec(2,9), vec(12,3))));  //for the concentration
                            vbuf[i].bg1.text(vec(2,9), Font, Val[i]);
                            break;
                    case 13: //RctRate
                            vbuf[i].bg0.image(vec(0,0), RctRate);
                            break;
                    case 14: //MolConcSelected
                            vbuf[i].bg0.image(vec(0,0), MolConcSelected);
                            vbuf[i].bg1.setMask((BG1Mask::filled(vec(5,5), vec(10,3))));  //for the name
                            vbuf[i].bg1.setMask((BG1Mask::filled(vec(2,9), vec(12,3))));  //for the concentration
                            //write 
                            vbuf[i].bg1.text(vec(5,5), Font, "M");
                            vbuf[i].bg1.text(vec(2,9), Font, Val[i]);
                            break;
                    case 15: //EnzConcSelected
                            vbuf[i].bg0.image(vec(0,0), EnzConcSelected);
                            vbuf[i].bg1.setMask((BG1Mask::filled(vec(5,5), vec(10,3))));  //for the name
                            vbuf[i].bg1.setMask((BG1Mask::filled(vec(2,9), vec(12,3))));  //for the concentration

                            vbuf[i].bg1.text(vec(5,5), Font, "E");
                            vbuf[i].bg1.text(vec(2,9), Font, Val[i]);
                            break;

                    case 16: //RctRateSelected
                            vbuf[i].bg0.image(vec(0,0), RctRateSelected);
                            vbuf[i].bg1.setMask((BG1Mask::filled(vec(2,4), vec(10,3))));  //for the reaction constant
                            vbuf[i].bg1.text(vec(2,4), Font, Val[i]);
                            break;
                    case 17://Direction
                            vbuf[i].bg0.image(vec(0,0), Direction);

                            break;
                    case 18: //selectCSV
                             vbuf[i].bg0.image(vec(0,0), SelectCSV);
                             break;
                    case 19: //Play the simulation
                             vbuf[i].bg0.image(vec(0,0), Play);
                             break;
                    case 20: //Stop Simulation
                             vbuf[i].bg0.image(vec(0,0), Stop);
                             break;
                    case 21: //Quit Pathways
                             vbuf[i].bg0.image(vec(0,0), Quit);
                             break;
                    case 22: //Reaction
                            vbuf[i].bg0.image(vec(0,0), Reaction);
                             break;

                }

                 update[i] = false;
            }
        }
        System::paint();
    }
}

void ReadPacket()
{
    UsbPacket packet;
    while (usbPipe.read(packet))
    {
        unsigned char *message = packet.bytes();
        switch (message[0])
        {
            case 1: //update bound variables/values (param, minValue, maxValue, bar_idx, local/remote)
            {
                //the format for the message is cube, length of parameter, parameter, minValue (length of 3), maxValue (length of 3), bar_idx, local/remote
                unsigned idCube = message[1];
                char *newVal;
                Val[idCube][0] = message[3]+'0';
                Val[idCube][1] = '.';
                Val[idCube][2] = message[5]+'0';
               
                update[idCube] = true;
                
                break;
            }
            case 2:  //update the binding data- who is it bound to
            {   //the message format is cubeId,length of param , element type, name, concentration/speed value
                unsigned idCube = message[1];
                boundTo[idCube] = message[3];
                
                Val[idCube][0] = message[4]+'0';
                Val[idCube][1] = '.';
                Val[idCube][2] = message[5]+'0';

                update[idCube] = true;
                break;
            }
            case 3: //update the concentration/speed value has changed
            {
                //the mesage format is cube, local or remote
                unsigned idCube = message[1];
                Val[idCube][0] = message[3]+'0';
                Val[idCube][1] = '.';
                Val[idCube][2] = message[5]+'0';
                update[idCube] = true;
                break;

                
            }
            case 4: // to unbind the cube
            {
             unsigned idCube = message[1];
             boundTo[idCube] = 0;
             update[idCube] = true;
             break;

            }

            case 5: //to change the state of the cube
            {
                unsigned idCube = message[1];
                state[idCube]=message[3];
                update[idCube] = true;
                break;
            }

        }
    }
}

void WritePacket(int type, int packetLength, unsigned char* bytes)
{
   /*
    * This is one way to write packets to the UsbPipe; using reserve()
    * and commit(). If you already have a buffer that you want to copy to the
    * UsbPipe, you can use write().
    */
    if (Usb::isConnected() && usbPipe.writeAvailable()) {

        /*
         * Access some buffer space for writing the next packet. This
         * is the zero-copy API for writing packets. Both reading and writing
         * have a traditional (one copy) API and a zero-copy API.
         */

        UsbPacket &packet = usbPipe.sendQueue.reserve();

        /*
         * Fill most of the packet with dummy data
         */

        // 28-bit type code, for our own application's use
       // packet.setType(0x5);
         packet.setType(type);

        packet.resize(packet.capacity());

        unsigned i;
        for (i = 0; i<packetLength; i++)
        packet.bytes()[i] = bytes[i];

        for (; i < packet.capacity(); ++i) {
            packet.bytes()[i] = 0;
        }


        /*
         * Log the packet for debugging, and commit it to the FIFO.
         * The system will asynchronously send it to our peer.
         */

        usbPipe.sendQueue.commit();
    }
}

/*** end ***/
